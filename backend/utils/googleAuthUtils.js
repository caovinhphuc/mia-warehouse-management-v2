/**
 * Google Auth Utilities - Backend
 * Xử lý private key tương thích Node.js 17+ (OpenSSL 3)
 * Chuyển RSA format (BEGIN RSA PRIVATE KEY) → PKCS#8 (BEGIN PRIVATE KEY)
 * để tránh lỗi: error:1E08010C:DECODER routines::unsupported (ERR_OSSL_UNSUPPORTED)
 */

const crypto = require('crypto')
const { execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

/**
 * Convert RSA → PKCS#8 dùng openssl CLI (fallback khi Node crypto fail trên OpenSSL 3)
 */
function convertWithOpenssl(rsaKey) {
  const tmpDir = os.tmpdir()
  const inPath = path.join(tmpDir, `rsa-key-${process.pid}.pem`)
  const outPath = path.join(tmpDir, `pkcs8-key-${process.pid}.pem`)
  try {
    fs.writeFileSync(inPath, rsaKey, { mode: 0o600 })
    execSync(`openssl pkcs8 -topk8 -nocrypt -in "${inPath}" -out "${outPath}"`, {
      stdio: 'pipe',
    })
    const pkcs8 = fs.readFileSync(outPath, 'utf8')
    return pkcs8
  } finally {
    try {
      fs.unlinkSync(inPath)
      fs.unlinkSync(outPath)
    } catch (_) {}
  }
}

/**
 * Chuẩn hóa private key: nếu là RSA format cũ thì convert sang PKCS#8
 * @param {string} privateKey - PEM string (RSA hoặc PKCS#8)
 * @returns {string} - PEM PKCS#8
 */
function normalizePrivateKey(privateKey) {
  if (!privateKey || typeof privateKey !== 'string') return privateKey
  const trimmed = privateKey.trim()
  // Đã là PKCS#8 → không cần convert
  if (trimmed.includes('-----BEGIN PRIVATE KEY-----')) return trimmed
  // RSA format cũ → convert sang PKCS#8
  if (trimmed.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    try {
      const keyObject = crypto.createPrivateKey({
        key: trimmed,
        format: 'pem',
        type: 'pkcs1',
      })
      return keyObject.export({ format: 'pem', type: 'pkcs8' })
    } catch (_) {
      try {
        return convertWithOpenssl(trimmed)
      } catch (err) {
        console.warn('[googleAuthUtils] Convert RSA→PKCS#8 failed:', err.message)
        return privateKey
      }
    }
  }
  return privateKey
}

/**
 * Load và chuẩn hóa credentials từ object (sau khi parse JSON)
 * @param {object} credentials - object có .private_key
 * @returns {object} - credentials với private_key đã normalize
 */
function normalizeCredentials(credentials) {
  if (!credentials || !credentials.private_key) return credentials
  return {
    ...credentials,
    private_key: normalizePrivateKey(credentials.private_key),
  }
}

module.exports = { normalizePrivateKey, normalizeCredentials }
