/* eslint-disable */
/**
 * Encryption Service
 * Handles data encryption at rest and in transit
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Encryption configuration
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const TAG_LENGTH = 16; // 128 bits
const PBKDF2_ITERATIONS = 100000;

// Master encryption key (load from environment variable or key management service)
let MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY;

// Generate master key if not provided
if (!MASTER_KEY) {
  MASTER_KEY = crypto.randomBytes(KEY_LENGTH).toString("hex");
  console.warn(
    "⚠️  WARNING: Using auto-generated master key. Set ENCRYPTION_MASTER_KEY in production!"
  );
}

// Key derivation function
const deriveKey = (password, salt) => {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    "sha256"
  );
};

/**
 * Encrypt data at rest
 */
const encryptAtRest = (data, key = null) => {
  try {
    const encryptionKey = key
      ? Buffer.from(key, "hex")
      : Buffer.from(MASTER_KEY, "hex");
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      encryptionKey,
      iv
    );

    // Encrypt data
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Return encrypted data with metadata
    return {
      encrypted,
      iv: iv.toString("hex"),
      salt: salt.toString("hex"),
      tag: tag.toString("hex"),
      algorithm: ENCRYPTION_ALGORITHM,
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypt data at rest
 */
const decryptAtRest = (encryptedData, key = null) => {
  try {
    const encryptionKey = key
      ? Buffer.from(key, "hex")
      : Buffer.from(MASTER_KEY, "hex");
    const iv = Buffer.from(encryptedData.iv, "hex");
    const tag = Buffer.from(encryptedData.tag, "hex");

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      encryptionKey,
      iv
    );
    decipher.setAuthTag(tag);

    // Decrypt data
    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

/**
 * Encrypt data in transit (for API responses)
 */
const encryptInTransit = (data, recipientPublicKey = null) => {
  try {
    // For in-transit encryption, we can use:
    // 1. TLS/HTTPS (handled at transport layer)
    // 2. End-to-end encryption with recipient's public key

    if (recipientPublicKey) {
      // RSA encryption with recipient's public key
      const buffer = Buffer.from(JSON.stringify(data));
      const encrypted = crypto.publicEncrypt(
        {
          key: recipientPublicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        buffer
      );

      return encrypted.toString("base64");
    }

    // Fallback: Return data as-is (rely on HTTPS)
    return data;
  } catch (error) {
    console.error("In-transit encryption error:", error);
    throw new Error("Failed to encrypt data in transit");
  }
};

/**
 * Decrypt data in transit
 */
const decryptInTransit = (encryptedData, privateKey) => {
  try {
    const buffer = Buffer.from(encryptedData, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    );

    return JSON.parse(decrypted.toString("utf8"));
  } catch (error) {
    console.error("In-transit decryption error:", error);
    throw new Error("Failed to decrypt data in transit");
  }
};

/**
 * Generate encryption key pair (RSA)
 */
const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { publicKey, privateKey };
};

/**
 * Hash sensitive data (one-way encryption)
 */
const hashSensitiveData = (data, salt = null) => {
  const dataSalt = salt || crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(data + dataSalt)
    .digest("hex");

  return {
    hash,
    salt: dataSalt,
  };
};

/**
 * Verify hashed data
 */
const verifyHashedData = (data, hash, salt) => {
  const computedHash = crypto
    .createHash("sha256")
    .update(data + salt)
    .digest("hex");

  return computedHash === hash;
};

/**
 * Encrypt file at rest
 */
const encryptFile = async (filePath, outputPath = null) => {
  try {
    const fileData = fs.readFileSync(filePath);
    const encrypted = encryptAtRest(fileData.toString("base64"));

    const output = outputPath || `${filePath}.encrypted`;
    fs.writeFileSync(output, JSON.stringify(encrypted));

    return output;
  } catch (error) {
    console.error("File encryption error:", error);
    throw new Error("Failed to encrypt file");
  }
};

/**
 * Decrypt file at rest
 */
const decryptFile = async (encryptedFilePath, outputPath = null) => {
  try {
    const encryptedData = JSON.parse(
      fs.readFileSync(encryptedFilePath, "utf8")
    );
    const decrypted = decryptAtRest(encryptedData);

    const output = outputPath || encryptedFilePath.replace(".encrypted", "");
    fs.writeFileSync(output, Buffer.from(decrypted, "base64"));

    return output;
  } catch (error) {
    console.error("File decryption error:", error);
    throw new Error("Failed to decrypt file");
  }
};

module.exports = {
  encryptAtRest,
  decryptAtRest,
  encryptInTransit,
  decryptInTransit,
  generateKeyPair,
  hashSensitiveData,
  verifyHashedData,
  encryptFile,
  decryptFile,
  ENCRYPTION_ALGORITHM,
};
