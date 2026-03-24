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

const tmpPrefix = `google-auth-${process.pid}-${Date.now()}`

/**
 * Convert bất kỳ PEM private key sang PKCS#8 qua openssl pkey (tương thích OpenSSL 3)
 * Dùng khi Node crypto.createPrivateKey/export vẫn gây DECODER::unsupported lúc JWT sign.
 */
function convertAnyPemWithOpenssl(pemKey) {
  const tmpDir = os.tmpdir()
  const inPath = path.join(tmpDir, `${tmpPrefix}-in.pem`)
  const outPath = path.join(tmpDir, `${tmpPrefix}-out.pem`)
  try {
    fs.writeFileSync(inPath, pemKey, { mode: 0o600 })
    execSync(`openssl pkey -in "${inPath}" -out "${outPath}"`, { stdio: 'pipe' })
    return fs.readFileSync(outPath, 'utf8')
  } finally {
    try {
      fs.unlinkSync(inPath)
      fs.unlinkSync(outPath)
    } catch (_) {}
  }
}

/**
 * Convert RSA → PKCS#8 dùng openssl CLI (fallback khi Node crypto fail trên OpenSSL 3)
 */
function convertWithOpenssl(rsaKey) {
  const tmpDir = os.tmpdir()
  const inPath = path.join(tmpDir, `${tmpPrefix}-rsa-in.pem`)
  const outPath = path.join(tmpDir, `${tmpPrefix}-rsa-out.pem`)
  try {
    fs.writeFileSync(inPath, rsaKey, { mode: 0o600 })
    execSync(`openssl pkcs8 -topk8 -nocrypt -in "${inPath}" -out "${outPath}"`, {
      stdio: 'pipe',
    })
    return fs.readFileSync(outPath, 'utf8')
  } finally {
    try {
      fs.unlinkSync(inPath)
      fs.unlinkSync(outPath)
    } catch (_) {}
  }
}

/**
 * Chuẩn hóa chuỗi PEM: line endings và literal \n từ JSON
 */
function normalizePemString(pem) {
  if (!pem || typeof pem !== 'string') return pem
  let s = pem.trim()
  s = s.replace(/\r\n/g, '\n').replace(/\\n/g, '\n')
  return s
}

/** Kiểm tra key có phải placeholder (chưa thay bằng key thật) không */
function isPlaceholderKey(pem) {
  if (!pem || typeof pem !== 'string') return true
  const m = pem.match(/-----BEGIN [A-Z0-9 ]+PRIVATE KEY-----([\s\S]*?)-----END [A-Z0-9 ]+PRIVATE KEY-----/)
  const body = m ? m[1].replace(/\s/g, '') : ''
  return body.length < 100 || body === '...' || body === '…'
}

/**
 * Chuẩn hóa private key: line endings, RSA/EC → PKCS#8 cho tương thích OpenSSL 3
 * @param {string} privateKey - PEM string (RSA, EC hoặc PKCS#8)
 * @returns {string} - PEM PKCS#8
 */
function normalizePrivateKey(privateKey) {
  if (!privateKey || typeof privateKey !== 'string') return privateKey
  const trimmed = normalizePemString(privateKey)
  if (!trimmed) return privateKey

  // PKCS#8: ưu tiên chuyển qua openssl pkey để key tương thích lúc JWT sign (tránh DECODER::unsupported)
  if (trimmed.includes('-----BEGIN PRIVATE KEY-----')) {
    try {
      return convertAnyPemWithOpenssl(trimmed)
    } catch (_) {
      try {
        const keyObject = crypto.createPrivateKey({ key: trimmed, format: 'pem' })
        return keyObject.export({ format: 'pem', type: 'pkcs8' })
      } catch (e) {
        return trimmed
      }
    }
  }

  // RSA (PKCS#1) → PKCS#8: ưu tiên openssl pkey rồi mới Node/openssl pkcs8
  if (trimmed.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    try {
      return convertAnyPemWithOpenssl(trimmed)
    } catch (_) {
      try {
        const keyObject = crypto.createPrivateKey({
          key: trimmed,
          format: 'pem',
          type: 'pkcs1',
        })
        return keyObject.export({ format: 'pem', type: 'pkcs8' })
      } catch (__) {
        try {
          const keyObject = crypto.createPrivateKey({ key: trimmed, format: 'pem' })
          return keyObject.export({ format: 'pem', type: 'pkcs8' })
        } catch (___) {
          try {
            return convertWithOpenssl(trimmed)
          } catch (err) {
            console.warn('[googleAuthUtils] RSA→PKCS#8 failed:', err.message)
            return privateKey
          }
        }
      }
    }
  }

  // EC PRIVATE KEY → PKCS#8: ưu tiên openssl pkey (tránh DECODER::unsupported)
  if (trimmed.includes('-----BEGIN EC PRIVATE KEY-----')) {
    try {
      return convertAnyPemWithOpenssl(trimmed)
    } catch (_) {
      try {
        const keyObject = crypto.createPrivateKey({ key: trimmed, format: 'pem' })
        return keyObject.export({ format: 'pem', type: 'pkcs8' })
      } catch (err) {
        console.warn('[googleAuthUtils] EC→PKCS#8 failed:', err.message)
        return trimmed
      }
    }
  }

  return trimmed
}

/**
 * Load và chuẩn hóa credentials từ object (sau khi parse JSON)
 * @param {object} credentials - object có .private_key
 * @returns {object} - credentials với private_key đã normalize
 * @throws {Error} - nếu private_key là placeholder (chưa thay key thật)
 */
function normalizeCredentials(credentials) {
  if (!credentials || !credentials.private_key) return credentials
  const raw = normalizePemString(credentials.private_key)
  if (isPlaceholderKey(raw)) {
    throw new Error(
      'Private key trong file credentials có vẻ là placeholder (chưa thay bằng key thật). ' +
        'Vui lòng tải JSON key từ GCP Console (IAM → Service account → Keys) và đặt file vào backend/config/service-account-key.json ' +
        'hoặc set GOOGLE_SERVICE_ACCOUNT_KEY_PATH / GOOGLE_APPLICATION_CREDENTIALS. Xem docs/GOOGLE_SHEETS_DRIVE_SETUP.md.'
    )
  }
  return {
    ...credentials,
    private_key: normalizePrivateKey(credentials.private_key),
  }
}

module.exports = { normalizePrivateKey, normalizeCredentials }
