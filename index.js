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
// async function test() {
//   const clearTextMessage = "Hello, world"
//   const salt = window.crypto.getRandomValues(new Uint8Array(16))
//   const iv = window.crypto.getRandomValues(new Uint8Array(16))
//   const args = getArgs()
//   const data = new TextEncoder().encode(clearTextMessage)
//   const password = new TextEncoder().encode(args.password)
//   const key = await deriveKey({
//     ...args,
//     password,
//     salt,
//   })
//   const ciphertext = new Uint8Array(await encrypt({
//     ...args,
//     key,
//     iv,
//     data,
//   }))
//   const [part1, part2] = XORSplit(ciphertext)
//   const joined = XORJoin(part1, part2)
//   return await decrypt({
//     ...args,
//     ciphertext: joined,
//     key,
//     iv,
//   })
// }
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
    const kdfName = document.getElementById("kdfName").value;
    const kdfHashName = document.getElementById("kdfHashName").value;
    const kdfIterations = parseInt(document.getElementById("kdfIterations").value);
    const algoName = document.getElementById("algoName").value;
    const algoLength = parseInt(document.getElementById("algoLength").value);
    const fileSeparator = document.getElementById("fileSeparator").value;
    const file1 = document.getElementById("file1");
    const file2 = document.getElementById("file2");
    const fileSecret = document.getElementById("fileSecret");
    const fileName1 = file1.files[0].name;
    const fileName2 = file2.files[0].name;
    const fileData1 = await readFile(file1.files[0]);
    const fileData2 = await readFile(file2.files[0]);
    let fileSecretName = "secret";
    let fileSecretData = new Uint8Array(0);
    const secretBlob = fileSecret.files[0];
    if (secretBlob) {
        fileSecretData = await readFile(secretBlob);
        fileSecretName = secretBlob.name;
    }
    return {
        fileName1,
        fileName2,
        fileSecretName,
        fileData1,
        fileData2,
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
    const result = document.getElementById("result");
    result.classList.add("hidden");
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
    const [part1, part2] = XORSplit(ciphertext);
    const sep = new TextEncoder().encode(args.fileSeparator);
    if (rightIndexOfSubArray(part1, sep) !== -1 || rightIndexOfSubArray(part2, sep) !== -1) {
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
    const resultStegoFile1 = document.getElementById("resultStegoFile1");
    const resultStegoFile2 = document.getElementById("resultStegoFile2");
    const resultDecryptedFile = document.getElementById("resultDecryptedFile");
    setFile(resultStegoFile1, args.fileName1, fileData1);
    setFile(resultStegoFile2, args.fileName2, fileData2);
    resultStegoFile1.classList.remove("hidden");
    resultStegoFile2.classList.remove("hidden");
    resultDecryptedFile.classList.add("hidden");
    result.classList.remove("hidden");
}
async function mainDecrypt() {
    const result = document.getElementById("result");
    result.classList.add("hidden");
    const args = await getArgs();
    const sep = new TextEncoder().encode(args.fileSeparator);
    const part1 = args.fileData1.slice(rightIndexOfSubArray(args.fileData1, sep) + sep.length);
    const part2 = args.fileData2.slice(rightIndexOfSubArray(args.fileData2, sep) + sep.length);
    const ciphertext = XORJoin(part1, part2);
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
    const resultStegoFile1 = document.getElementById("resultStegoFile1");
    const resultStegoFile2 = document.getElementById("resultStegoFile2");
    const resultDecryptedFile = document.getElementById("resultDecryptedFile");
    setFile(resultDecryptedFile, "secret", decrypted);
    resultStegoFile1.classList.add("hidden");
    resultStegoFile2.classList.add("hidden");
    resultDecryptedFile.classList.remove("hidden");
    result.classList.remove("hidden");
}
