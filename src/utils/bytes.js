import CryptoJS from "crypto-js"

/**
 * 
 * @param {Uint8Array} file1 
 * @param {Uint8Array} file2 
 * @param {Uint8Array} secret 
 * @param {string} sep 
 * @param {string} password 
 * @returns {Array}
 */
export function hide(secret, sep, password, file1, file2) {
  const sepBytes = new TextEncoder().encode(sep)
  const enc = encryptUint8Array(secret, password);
  const part1 = getRandomBytes(enc.length);
  const part2 = xor(enc, part1);

  if (lastCommonOffset(sepBytes, part1, part2) !== undefined) {
    throw Error(`Separator '${sep}' can't reliably divide the files: please use a different one`);
  }

  const output1 = new Uint8Array([...file1, ...sepBytes, ...part1]);
  const output2 = new Uint8Array([...file2, ...sepBytes, ...part2]);

  if (lastCommonOffset(sepBytes, output1, output2) === undefined) {
    throw Error(`Unexpected error: can't find common separator '${sep}' in files`);
  }

  return [output1, output2]
}

/**
 * @param {string} sep 
 * @param {string} password 
 * @param {Uint8Array} file1 
 * @param {Uint8Array} file2 
 * @returns {Uint8Array}
 */
export function unhide(sep, password, file1, file2) {
  const sepBytes = new TextEncoder().encode(sep)
  const offset = lastCommonOffset(sepBytes, file1, file2);

  if (offset === undefined) {
    throw Error(`No valid separator found in files`);
  }

  const part1 = file1.slice(offset + sepBytes.length);
  const part2 = file2.slice(offset + sepBytes.length);
  const enc = xor(part1, part2);
  const dec = decryptUint8Array(enc, password);

  return dec
}

/**
 * @param {Uint8Array} needle
 * @param {Uint8Array} a 
 * @param {Uint8Array} b 
 */
export function lastCommonOffset(needle, a, b) {
  const t = new TextDecoder('ascii')
  needle = t.decode(needle)
  a = t.decode(a)
  b = t.decode(b)

  const maxOffset = Math.min(a.length, b.length)
  for (let offset = 0; offset < maxOffset; offset++) {
    const partA = a.slice(-offset, -offset + needle.length)
    const partB = b.slice(-offset, -offset + needle.length)
    if (needle === partA && needle === partB) {
      return -offset
    }
  }
}

/**
 * @param {Uint8Array} a 
 * @param {string} password 
 */
export function decryptUint8Array(a, password) {
  const cipherWordArray = CryptoJS.lib.WordArray.create(a)
  const cipherBase64 = CryptoJS.enc.Base64.stringify(cipherWordArray)
  const wordArray = CryptoJS.AES.decrypt(cipherBase64, password)
  return wordArrayToUint8Array(wordArray)
}

/**
 * @param {Uint8Array} a 
 * @param {string} password 
 */
export function encryptUint8Array(a, password) {
  const secretWordArray = CryptoJS.lib.WordArray.create(a)
  const enc = CryptoJS.AES.encrypt(secretWordArray, password)
  const wordArray = cipherToWordArray(enc)
  return wordArrayToUint8Array(wordArray)
}

/**
 * 
 * @param {Uint8Array} a 
 * @param {Uint8Array} b 
 */
export function xor(a, b) {
  if (a.length !== b.length) {
    throw Error('xor: arrays length doesnt match')
  }
  const l = a.length
  const c = new Uint8Array(l)
  for (let i = 0; i < l; i++) {
    c[i] = a[i] ^ b[i]
  }
  return c
}

/**
 * @param {number} count 
 * @param {number} maxBulk 
 */
export function getRandomBytes(count, maxBulk = 65535) {
  const a = []
  while (count > 0) {
    const bulk = Math.min(count, maxBulk)
    const b = new Uint8Array(bulk)
    count -= bulk
    window.crypto.getRandomValues(b);
    a.push(...b)
  }
  return new Uint8Array(a)
}

/**
 * @param {Uint8Array} data 
 * @param {string} mimeType 
 */
export function bytesToOctetStream(data, mimeType = "application/octet-stream") {
  const blob = new Blob([data], {
    type: mimeType
  });
  return window.URL.createObjectURL(blob);
}

export function wordArrayToUint8Array(wordArray) {
  const l = wordArray.sigBytes;
  const words = wordArray.words;
  const result = new Uint8Array(l);
  var i = 0 /*dst*/, j = 0 /*src*/;
  while (true) {
    // here i is a multiple of 4
    if (i == l)
      break;
    var w = words[j++];
    result[i++] = (w & 0xff000000) >>> 24;
    if (i == l)
      break;
    result[i++] = (w & 0x00ff0000) >>> 16;
    if (i == l)
      break;
    result[i++] = (w & 0x0000ff00) >>> 8;
    if (i == l)
      break;
    result[i++] = (w & 0x000000ff);
  }
  return result;
}

export function cipherToWordArray(cipherParams) {
  const ciphertext = cipherParams.ciphertext;
  const salt = cipherParams.salt;

  if (salt) {
    return CryptoJS.lib.WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
  } else {
    return ciphertext;
  }
}