#!/usr/bin/env node
/**
 * Kiểm tra đăng nhập: backend health, auth/verify, auth/login
 * Chạy: node scripts/check-login.js
 * Hoặc: npm run check:login
 *
 * Tự động dùng email/password từ .env nếu có:
 *   CHECK_LOGIN_EMAIL=your@email.com
 *   CHECK_LOGIN_PASSWORD=yourpassword
 * Nếu không set → chỉ kiểm tra health + verify, không gọi login.
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const API_BASE_URL =
  process.env.VITE_API_URL ||
  process.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:3001'

const CHECK_EMAIL = process.env.CHECK_LOGIN_EMAIL || ''
const CHECK_PASSWORD = process.env.CHECK_LOGIN_PASSWORD || ''

const TIMEOUT_MS = 15000

async function fetchOk(url, options = {}) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    clearTimeout(t)
    return res
  } catch (e) {
    clearTimeout(t)
    throw e
  }
}

async function main() {
  console.log('🔐 Kiểm tra đăng nhập\n')
  console.log(`   API: ${API_BASE_URL}\n`)

  let allOk = true

  // --- 1. Backend health ---
  process.stdout.write('1. Backend health (GET /health) ... ')
  try {
    const healthRes = await fetchOk(`${API_BASE_URL}/health`)
    if (healthRes.ok) {
      console.log('✅ OK')
    } else {
      console.log(`❌ ${healthRes.status} ${healthRes.statusText}`)
      allOk = false
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log('❌ Timeout (backend không phản hồi trong 15s)')
    } else if (e.cause?.code === 'ECONNREFUSED' || e.message?.includes('fetch failed')) {
      console.log('❌ Không kết nối được (backend chưa chạy hoặc URL sai)')
    } else {
      console.log(`❌ ${e.message}`)
    }
    console.log('\n   → Local: npm run start:backend (API: http://localhost:3001)')
    console.log('   → Hoặc set VITE_API_URL=http://localhost:3001 trong .env để test local')
    allOk = false
  }

  // --- 2. Auth verify (không token → 401) ---
  process.stdout.write('2. Auth verify (GET /api/auth/verify, không token) ... ')
  try {
    const verifyRes = await fetchOk(`${API_BASE_URL}/api/auth/verify`)
    if (verifyRes.status === 401) {
      console.log('✅ OK (401 như mong đợi khi chưa gửi token)')
    } else if (verifyRes.ok) {
      console.log('⚠️ 200 (có token hợp lệ trong request?)')
    } else {
      console.log(`❌ ${verifyRes.status}`)
      allOk = false
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log('❌ Timeout')
    } else {
      console.log(`❌ ${e.message}`)
    }
    allOk = false
  }

  // --- 3. Login ---
  if (CHECK_EMAIL && CHECK_PASSWORD) {
    process.stdout.write('3. Login (POST /api/auth/login) ... ')
    try {
      const loginRes = await fetchOk(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: CHECK_EMAIL,
          password: CHECK_PASSWORD,
        }),
      })
      const data = await loginRes.json().catch(() => ({}))
      if (loginRes.ok && data.success) {
        if (data.requiresMFA) {
          console.log('⚠️ Yêu cầu MFA (đúng email/password, cần nhập mã MFA)')
        } else if (data.data?.token) {
          console.log('✅ Đăng nhập thành công (có token)')
        } else {
          console.log('⚠️ success=true nhưng không có token:', Object.keys(data))
        }
      } else if (loginRes.status === 401) {
        console.log('❌ 401 - Sai email hoặc mật khẩu')
        if (data.error) console.log(`   ${data.error}`)
        allOk = false
      } else if (loginRes.status === 400) {
        console.log('❌ 400 - Thiếu email/password hoặc format sai')
        if (data.error) console.log(`   ${data.error}`)
        allOk = false
      } else {
        console.log(`❌ ${loginRes.status} - ${data.error || data.message || loginRes.statusText}`)
        allOk = false
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('❌ Timeout')
      } else {
        console.log(`❌ ${e.message}`)
      }
      allOk = false
    }
  } else {
    console.log('3. Login ... ⏭️  Bỏ qua (chưa set CHECK_LOGIN_EMAIL / CHECK_LOGIN_PASSWORD trong .env)')
    console.log('   Để kiểm tra login tự động, thêm vào .env:')
    console.log('   CHECK_LOGIN_EMAIL=your@email.com')
    console.log('   CHECK_LOGIN_PASSWORD=yourpassword')
  }

  console.log('')
  if (allOk) {
    console.log('📋 Kết luận: Các bước kiểm tra đều pass.')
    if (!CHECK_EMAIL || !CHECK_PASSWORD) {
      console.log('   Set email/password trong .env để test luôn bước đăng nhập.')
    }
  } else {
    console.log('📋 Kết luận: Có bước lỗi. Kiểm tra:')
    console.log('   - Backend đang chạy: npm run start:backend')
    console.log('   - Đúng URL trong .env: VITE_API_URL hoặc REACT_APP_API_URL')
    console.log('   - CORS: backend cho phép origin frontend (localhost:5173 / 3000)')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
