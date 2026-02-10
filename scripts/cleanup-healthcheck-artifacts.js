#!/usr/bin/env node
/**
 * Xoá các tab Sheet và thư mục Drive do health check tạo ra (HealthCheck_*)
 * Chạy: node scripts/cleanup-healthcheck-artifacts.js
 * Hoặc: npm run cleanup:healthcheck
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const path = require('path')

// Load env vars cho backend (GOOGLE_SHEET_ID, GOOGLE_DRIVE_FOLDER_ID, etc.)
const sheetId =
  process.env.GOOGLE_SHEET_ID ||
  process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID

const HEALTHCHECK_PREFIX = 'HealthCheck_'

async function cleanupSheets() {
  if (!sheetId) {
    console.log('⚠️  Bỏ qua Sheets: Chưa cấu hình GOOGLE_SHEET_ID / VITE_GOOGLE_SHEETS_SPREADSHEET_ID')
    return { deleted: 0, skipped: true }
  }

  const sheetsService = require(path.join(__dirname, '..', 'backend', 'services', 'googleSheetsService'))
  await sheetsService.initialize()

  const metadata = await sheetsService.getSheetMetadata(sheetId)
  const toDelete = metadata.sheets.filter((s) => s.title.startsWith(HEALTHCHECK_PREFIX))

  if (toDelete.length === 0) {
    console.log('✅ Google Sheets: Không có tab HealthCheck_* cần xoá')
    return { deleted: 0 }
  }

  const sheets = await sheetsService.getSheets()
  const requests = toDelete.map((s) => ({
    deleteSheet: { sheetId: s.sheetId },
  }))

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: { requests },
  })

  console.log(`✅ Google Sheets: Đã xoá ${toDelete.length} tab: ${toDelete.map((s) => s.title).join(', ')}`)
  return { deleted: toDelete.length }
}

async function cleanupDriveFolders() {
  const driveService = require(path.join(__dirname, '..', 'backend', 'services', 'googleDriveService'))
  await driveService.initialize()
  const drive = await driveService.getDrive()

  // Tìm tất cả folder HealthCheck_* trong Drive (có thể ở root hoặc trong folder cấu hình)
  const query = `name contains '${HEALTHCHECK_PREFIX}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

  const allFiles = []
  let pageToken = null
  do {
    const res = await drive.files.list({
      q: query,
      pageSize: 100,
      fields: 'nextPageToken, files(id, name)',
      pageToken,
    })
    allFiles.push(...(res.data.files || []))
    pageToken = res.data.nextPageToken
  } while (pageToken)

  if (allFiles.length === 0) {
    console.log('✅ Google Drive: Không có thư mục HealthCheck_* cần xoá')
    return { deleted: 0 }
  }

  for (const file of allFiles) {
    await driveService.deleteFile(file.id)
    console.log(`   Đã xoá folder: ${file.name} (${file.id})`)
  }

  console.log(`✅ Google Drive: Đã xoá ${allFiles.length} thư mục HealthCheck_*`)
  return { deleted: allFiles.length }
}

async function main() {
  console.log('🧹 Dọn dẹp HealthCheck artifacts...\n')

  let sheetsResult = { deleted: 0 }
  let driveResult = { deleted: 0 }

  try {
    sheetsResult = await cleanupSheets()
  } catch (err) {
    console.error('❌ Lỗi khi xoá Sheets:', err.message)
  }

  try {
    driveResult = await cleanupDriveFolders()
  } catch (err) {
    console.error('❌ Lỗi khi xoá Drive:', err.message)
  }

  const total = sheetsResult.deleted + driveResult.deleted
  console.log(`\n📊 Tổng: Đã xoá ${total} items (${sheetsResult.deleted} tab Sheets, ${driveResult.deleted} folder Drive)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
