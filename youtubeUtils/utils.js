const crypto = require("react-native-quick-crypto");
const Buffer = global.Buffer;

async function encryptRequest(clientKey, data) {
  if (clientKey.length !== 32) {
    throw new Error("Invalid client key length");
  }

  const aesKeyData = clientKey.slice(0, 16);
  const hmacKeyData = clientKey.slice(16, 32);

  const iv = crypto.randomBytes(16);

  const aesKey = crypto.createCipheriv("aes-128-ctr", aesKeyData, iv);
  const encrypted = Buffer.concat([aesKey.update(data), aesKey.final()]);

  const hmac = crypto
    .createHmac("sha256", hmacKeyData)
    .update(Buffer.concat([encrypted, iv]))
    .digest();

  return {
    encrypted: Uint8Array.from(encrypted),
    hmac: Uint8Array.from(hmac),
    iv: Uint8Array.from(iv),
  };
}

async function decryptResponse(iv, hmac, data, clientKeyData) {
  if (!iv || !hmac || !data || !clientKeyData) {
    throw new Error("Invalid input");
  }

  const aesKeyData = clientKeyData.slice(0, 16);
  const hmacKeyData = clientKeyData.slice(16, 32);

  const hmacCalculated = crypto
    .createHmac("sha256", hmacKeyData)
    .update(Buffer.concat([data, iv]))
    .digest();

  if (!hmacCalculated.every((byte, i) => byte === hmac[i])) {
    throw new Error("HMAC verification failed");
  }

  const aesKey = crypto.createDecipheriv("aes-128-ctr", aesKeyData, iv);
  const decryptedData = Buffer.concat([aesKey.update(data), aesKey.final()]);

  return Uint8Array.from(decryptedData);
}

module.exports = { encryptRequest, decryptResponse };
