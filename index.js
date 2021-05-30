"use strict";
async function deriveKey(args) {
    const keyMaterial = await window.crypto.subtle.importKey("raw", args.password, {
        name: args.kdfName,
    }, false, [
        "deriveBits",
        "deriveKey",
    ]);
    return await window.crypto.subtle.deriveKey({
        name: args.kdfName,
        salt: args.salt,
        iterations: args.kdfIterations,
        hash: args.kdfHashName,
    }, keyMaterial, {
        name: args.algoName,
        length: args.algoLength,
    }, true, [
        "encrypt",
        "decrypt",
    ]);
}
async function encrypt(args) {
    return await crypto.subtle.encrypt({
        name: args.algoName,
        length: args.algoLength,
        iv: args.iv,
    }, args.key, args.data);
}
async function decrypt(args) {
    return await crypto.subtle.decrypt({
        name: args.algoName,
        length: args.algoLength,
        iv: args.iv
    }, args.key, args.ciphertext);
}
function XORSplit(secret) {
    const part1 = window.crypto.getRandomValues(new Uint8Array(secret.byteLength));
    const part2 = new Uint8Array(secret.byteLength);
    for (let i = 0; i < secret.byteLength; i++) {
        part2[i] = part1[i] ^ secret[i];
    }
    return [part1, part2];
}
function XORJoin(part1, part2) {
    const secret = new Uint8Array(part1.byteLength);
    for (let i = 0; i < secret.byteLength; i++) {
        secret[i] = part1[i] ^ part2[i];
    }
    return secret;
}
async function readFile(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(new Uint8Array(reader.result));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}
async function getArgs() {
    const password = document.getElementById("password").value.trim();
    if (password.length === 0) {
        throw Error(`Password is required!`);
    }
    const kdfName = document.getElementById("kdfName").value;
    const kdfHashName = document.getElementById("kdfHashName").value;
    const kdfIterations = parseInt(document.getElementById("kdfIterations").value);
    const algoName = document.getElementById("algoName").value;
    const algoLength = parseInt(document.getElementById("algoLength").value);
    const fileSeparator = document.getElementById("fileSeparator").value;
    const file1 = document.getElementById("file1");
    const file2 = document.getElementById("file2");
    const file3 = document.getElementById("file3");
    const file4 = document.getElementById("file4");
    const fileSecret = document.getElementById("fileSecret");
    const fileName1 = file1.files[0].name;
    const fileData1 = await readFile(file1.files[0]);
    const fileName2 = file2.files[0].name;
    const fileData2 = await readFile(file2.files[0]);
    let fileBlob;
    let fileName3 = undefined;
    let fileData3 = undefined;
    fileBlob = file3.files[0];
    if (fileBlob) {
        fileName3 = fileBlob.name;
        fileData3 = await readFile(fileBlob);
    }
    let fileName4 = undefined;
    let fileData4 = undefined;
    fileBlob = file4.files[0];
    if (fileBlob) {
        fileName4 = fileBlob.name;
        fileData4 = await readFile(fileBlob);
    }
    let fileSecretName = "secret";
    let fileSecretData = new Uint8Array(0);
    const secretBlob = fileSecret.files[0];
    if (secretBlob) {
        fileSecretName = secretBlob.name;
        fileSecretData = await readFile(secretBlob);
    }
    return {
        fileName1,
        fileName2,
        fileName3,
        fileName4,
        fileSecretName,
        fileData1,
        fileData2,
        fileData3,
        fileData4,
        fileSecretData,
        fileSeparator,
        password,
        kdfName,
        kdfHashName,
        kdfIterations,
        algoName,
        algoLength,
    };
}
function setFile(a, name, data) {
    const blob = new Blob([data], { type: "octet/stream" });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    return a;
}
function rightIndexOfSubArray(haystack, needle, end = -1) {
    if (end === -1) {
        end = haystack.length;
    }
    for (let i = end - 1; i >= 0; i--) {
        if (haystack.slice(i, i + needle.length).toString() === needle.toString()) {
            return i;
        }
    }
    return -1;
}
async function mainEncrypt() {
    const args = await getArgs();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const password = new TextEncoder().encode(args.password);
    const key = await deriveKey({ ...args, password, salt });
    const encrypted = new Uint8Array(await encrypt({
        ...args,
        key,
        iv,
        data: args.fileSecretData,
    }));
    const ciphertext = new Uint8Array(encrypted.length + salt.length + iv.length);
    ciphertext.set(salt, 0);
    ciphertext.set(iv, salt.length);
    ciphertext.set(encrypted, salt.length + iv.length);
    let [part1, part2] = XORSplit(ciphertext);
    let part3 = undefined;
    let part4 = undefined;
    if (args.fileData3) {
        [part2, part3] = XORSplit(part2);
    }
    if (args.fileData4) {
        [part2, part4] = XORSplit(part2);
    }
    const sep = new TextEncoder().encode(args.fileSeparator);
    if (rightIndexOfSubArray(part1, sep) !== -1 || rightIndexOfSubArray(part2, sep) !== -1) {
        throw Error(`File separator collision!`);
    }
    if (part3 && rightIndexOfSubArray(part3, sep) !== -1) {
        throw Error(`File separator collision!`);
    }
    if (part4 && rightIndexOfSubArray(part4, sep) !== -1) {
        throw Error(`File separator collision!`);
    }
    const fileData1 = new Uint8Array(args.fileData1.byteLength + sep.byteLength + part1.byteLength);
    fileData1.set(args.fileData1, 0);
    fileData1.set(sep, args.fileData1.byteLength);
    fileData1.set(part1, args.fileData1.byteLength + sep.byteLength);
    const fileData2 = new Uint8Array(args.fileData2.byteLength + sep.byteLength + part2.byteLength);
    fileData2.set(args.fileData2, 0);
    fileData2.set(sep, args.fileData2.byteLength);
    fileData2.set(part2, args.fileData2.byteLength + sep.byteLength);
    let fileData3 = undefined;
    if (part3 && args.fileData3) {
        fileData3 = new Uint8Array(args.fileData3.byteLength + sep.byteLength + part3.byteLength);
        fileData3.set(args.fileData3, 0);
        fileData3.set(sep, args.fileData3.byteLength);
        fileData3.set(part3, args.fileData3.byteLength + sep.byteLength);
    }
    let fileData4 = undefined;
    if (part4 && args.fileData4) {
        fileData4 = new Uint8Array(args.fileData4.byteLength + sep.byteLength + part4.byteLength);
        fileData4.set(args.fileData4, 0);
        fileData4.set(sep, args.fileData4.byteLength);
        fileData4.set(part4, args.fileData4.byteLength + sep.byteLength);
    }
    const resultStegoFile1 = document.getElementById("resultStegoFile1");
    const resultStegoFile2 = document.getElementById("resultStegoFile2");
    const resultStegoFile3 = document.getElementById("resultStegoFile3");
    const resultStegoFile4 = document.getElementById("resultStegoFile4");
    setFile(resultStegoFile1, args.fileName1, fileData1);
    resultStegoFile1.classList.remove("hidden");
    setFile(resultStegoFile2, args.fileName2, fileData2);
    resultStegoFile2.classList.remove("hidden");
    if (fileData3 && args.fileName3) {
        setFile(resultStegoFile3, args.fileName3, fileData3);
        resultStegoFile3.classList.remove("hidden");
    }
    if (fileData4 && args.fileName4) {
        setFile(resultStegoFile4, args.fileName4, fileData4);
        resultStegoFile4.classList.remove("hidden");
    }
    const form = document.getElementById("form");
    form.classList.add("hidden");
    const result = document.getElementById("result");
    result.classList.remove("hidden");
}
async function mainDecrypt() {
    const args = await getArgs();
    const sep = new TextEncoder().encode(args.fileSeparator);
    const part1 = args.fileData1.slice(rightIndexOfSubArray(args.fileData1, sep) + sep.length);
    const part2 = args.fileData2.slice(rightIndexOfSubArray(args.fileData2, sep) + sep.length);
    let ciphertext = XORJoin(part1, part2);
    if (args.fileData3) {
        let anotherPart = args.fileData3.slice(rightIndexOfSubArray(args.fileData3, sep) + sep.length);
        ciphertext = XORJoin(ciphertext, anotherPart);
    }
    if (args.fileData4) {
        let anotherPart = args.fileData4.slice(rightIndexOfSubArray(args.fileData4, sep) + sep.length);
        ciphertext = XORJoin(ciphertext, anotherPart);
    }
    const salt = ciphertext.slice(0, 16);
    const iv = ciphertext.slice(16, 32);
    const encrypted = ciphertext.slice(32);
    const password = new TextEncoder().encode(args.password);
    const key = await deriveKey({ ...args, password, salt });
    const decrypted = new Uint8Array(await decrypt({
        ...args,
        ciphertext: encrypted,
        key,
        iv
    }));
    const resultDecryptedFile = document.getElementById("resultDecryptedFile");
    setFile(resultDecryptedFile, "secret", decrypted);
    const form = document.getElementById("form");
    form.classList.add("hidden");
    const result = document.getElementById("result");
    result.classList.remove("hidden");
    resultDecryptedFile.classList.remove("hidden");
}
