#!/usr/bin/env node

/**
 * Test Google Sheets Connection Script
 * Kiểm tra kết nối Google Sheets và tạo dữ liệu mẫu
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

// Google Sheets configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(__dirname, "../../automation/config/google-credentials.json");

// Sample data
const SAMPLE_DATA = {
  orders: [
    ["Ngày", "Sản phẩm", "Số lượng", "Giá", "Trạng thái", "Khách hàng"],
    ["2025-09-13", "Sản phẩm A", "5", "150000", "Hoàn thành", "Nguyễn Văn A"],
    ["2025-09-13", "Sản phẩm B", "3", "200000", "Đang xử lý", "Trần Thị B"],
    ["2025-09-12", "Sản phẩm C", "2", "300000", "Hoàn thành", "Lê Văn C"],
    ["2025-09-12", "Sản phẩm A", "4", "150000", "Hoàn thành", "Phạm Thị D"],
  ],
  dashboard: [
    ["Metric", "Value", "Change", "Status"],
    ["Tổng đơn hàng", "1250", "+12%", "Tăng"],
    ["Doanh thu", "1250000000", "+8%", "Tăng"],
    ["Khách hàng mới", "89", "+15%", "Tăng"],
    ["Tỷ lệ chuyển đổi", "3.2%", "-0.5%", "Giảm"],
  ],
};

async function testGoogleSheetsConnection() {
  console.log("🔍 KIỂM TRA GOOGLE SHEETS CONNECTION");
  console.log("=====================================");
  console.log("");

  try {
    // 1. Kiểm tra credentials file
    console.log("📋 Bước 1: Kiểm tra credentials file...");
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(`❌ Không tìm thấy credentials file: ${CREDENTIALS_PATH}`);
    }
    console.log("✅ Credentials file tồn tại");

    // 2. Kiểm tra environment variables
    console.log("📋 Bước 2: Kiểm tra environment variables...");
    const spreadsheetId = process.env.REACT_APP_GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId || spreadsheetId === "your-spreadsheet-id") {
      console.log("⚠️  Chưa có Google Sheets ID thực tế");
      console.log("📝 Hướng dẫn:");
      console.log("   1. Tạo Google Sheets mới tại: https://sheets.google.com");
      console.log("   2. Copy Sheet ID từ URL (giữa /d/ và /edit)");
      console.log("   3. Cập nhật REACT_APP_GOOGLE_SHEET_ID trong .env file");
      console.log("");
      return false;
    }
    console.log(`✅ Google Sheets ID: ${spreadsheetId}`);

    // 3. Load credentials
    console.log("📋 Bước 3: Load Google credentials...");
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

    if (credentials.project_id === "your-project-id") {
      console.log("⚠️  Credentials file chưa được cấu hình đúng");
      console.log("📝 Hướng dẫn:");
      console.log("   1. Tạo Google Cloud Project");
      console.log("   2. Enable Google Sheets API");
      console.log("   3. Tạo Service Account và download JSON key");
      console.log("   4. Thay thế nội dung file google-credentials.json");
      console.log("");
      return false;
    }
    console.log(`✅ Project ID: ${credentials.project_id}`);

    // 4. Authenticate
    console.log("📋 Bước 4: Authenticate với Google APIs...");
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: "v4", auth });
    console.log("✅ Authentication thành công");

    // 5. Test connection
    console.log("📋 Bước 5: Test kết nối với Google Sheets...");
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    console.log(`✅ Kết nối thành công!`);
    console.log(`📊 Spreadsheet title: ${response.data.properties.title}`);
    console.log(`📋 Sheets: ${response.data.sheets.map((s) => s.properties.title).join(", ")}`);

    // 6. Tạo dữ liệu mẫu (nếu cần)
    console.log("📋 Bước 6: Kiểm tra và tạo dữ liệu mẫu...");

    // Kiểm tra sheet "Orders"
    const ordersSheet = response.data.sheets.find((s) => s.properties.title === "Orders");
    if (!ordersSheet) {
      console.log('📝 Tạo sheet "Orders"...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Orders",
                },
              },
            },
          ],
        },
      });
      console.log('✅ Đã tạo sheet "Orders"');
    } else {
      console.log('✅ Sheet "Orders" đã tồn tại');
    }

    // Ghi dữ liệu mẫu vào Orders sheet
    console.log("📝 Ghi dữ liệu mẫu vào Orders sheet...");
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: "Orders!A1:F10",
      valueInputOption: "RAW",
      resource: {
        values: SAMPLE_DATA.orders,
      },
    });
    console.log("✅ Đã ghi dữ liệu mẫu vào Orders sheet");

    // Kiểm tra sheet "Dashboard"
    const dashboardSheet = response.data.sheets.find((s) => s.properties.title === "Dashboard");
    if (!dashboardSheet) {
      console.log('📝 Tạo sheet "Dashboard"...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Dashboard",
                },
              },
            },
          ],
        },
      });
      console.log('✅ Đã tạo sheet "Dashboard"');
    } else {
      console.log('✅ Sheet "Dashboard" đã tồn tại');
    }

    // Ghi dữ liệu mẫu vào Dashboard sheet
    console.log("📝 Ghi dữ liệu mẫu vào Dashboard sheet...");
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: "Dashboard!A1:D10",
      valueInputOption: "RAW",
      resource: {
        values: SAMPLE_DATA.dashboard,
      },
    });
    console.log("✅ Đã ghi dữ liệu mẫu vào Dashboard sheet");

    console.log("");
    console.log("🎉 GOOGLE SHEETS SETUP HOÀN TẤT!");
    console.log("================================");
    console.log(`📊 Spreadsheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log("📋 Sheets đã tạo: Orders, Dashboard");
    console.log("📊 Dữ liệu mẫu đã được thêm vào");
    console.log("");
    console.log("✅ Bây giờ bạn có thể test Google Sheets integration trong frontend!");

    return true;
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    console.log("");
    console.log("🔧 TROUBLESHOOTING:");
    console.log("1. Kiểm tra Google Sheets ID trong .env file");
    console.log("2. Kiểm tra credentials file có đúng không");
    console.log("3. Đảm bảo đã chia sẻ sheet với Service Account email");
    console.log("4. Kiểm tra Google Sheets API đã được enable");
    return false;
  }
}

// Chạy test
if (require.main === module) {
  testGoogleSheetsConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Unexpected error:", error);
      process.exit(1);
    });
}

module.exports = { testGoogleSheetsConnection };
