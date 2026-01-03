/**
 * MIA Warehouse Management — Google Apps Script
 * Tạo đầy đủ cấu trúc Google Sheets với định dạng chuẩn
 * Sử dụng bằng cách chạy hàm setupWarehouseSheets()
 */

/**
 * Cấu hình tên sheet và cột
 */
const MW_SHEETS = {
  Users: {
    headers: [
      "Username",
      "Password",
      "Full Name",
      "Email",
      "Role",
      "Department",
      "Permissions",
      "Shift",
      "Updated",
    ],
    widths: [140, 140, 200, 240, 120, 160, 240, 120, 180],
  },
  AuditLog: {
    headers: [
      "Timestamp",
      "Action",
      "Username",
      "Details",
      "Status",
      "IP Address",
    ],
    widths: [200, 140, 160, 500, 120, 160],
  },
  LoginLog: {
    headers: [
      "Timestamp",
      "Action",
      "Username",
      "Details",
      "Status",
      "IP Address",
      "Session ID",
    ],
    widths: [200, 140, 160, 420, 120, 160, 260],
  },
  Sessions: {
    headers: ["Session ID", "User ID", "Login Time", "Expires At", "Is Active"],
    widths: [320, 180, 200, 200, 120],
  },
  Inventory: {
    headers: ["SKU", "Product Name", "Location", "Qty", "UoM", "Updated"],
    widths: [160, 300, 160, 100, 100, 180],
  },
  Transactions: {
    headers: [
      "Timestamp",
      "Txn Type",
      "SKU",
      "Qty",
      "From",
      "To",
      "Reference",
      "Operator",
    ],
    widths: [200, 140, 160, 100, 160, 160, 220, 180],
  },
  Locations: {
    headers: ["Location", "Zone", "Capacity", "Type", "Note", "Updated"],
    widths: [160, 120, 120, 120, 320, 180],
  },
  Dashboard: {
    headers: ["Metric", "Value", "Updated"],
    widths: [260, 140, 180],
  },
  Permissions: {
    headers: ["Role", "Permission", "Description"],
    widths: [160, 220, 420],
  },
};

/**
 * Điểm vào chính — Tạo toàn bộ Sheets với định dạng chuẩn
 */
function setupWarehouseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(MW_SHEETS).forEach(function (name, index) {
    var sheet = ensureSheet(ss, name);
    applyLayout(sheet, MW_SHEETS[name].headers, MW_SHEETS[name].widths);
  });

  applyConditionalFormatting(ss.getSheetByName("AuditLog"));
  applyConditionalFormatting(ss.getSheetByName("LoginLog"));

  SpreadsheetApp.flush();
}

/**
 * Tạo sheet nếu chưa có
 */
function ensureSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Áp dụng định dạng bảng tiêu chuẩn
 */
function applyLayout(sheet, headers, widths) {
  if (!sheet) return;
  sheet.clear({ contentsOnly: true });

  // Set headers
  if (headers && headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Header style
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setFontFamily("Inter")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#0EA5E9") // sky-500
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // Freeze first row
  sheet.setFrozenRows(1);

  // Column widths
  if (widths && widths.length) {
    widths.forEach(function (w, idx) {
      sheet.setColumnWidth(idx + 1, w);
    });
  }

  // Body style
  var bodyRange = sheet.getRange(
    2,
    1,
    Math.max(100, headers.length),
    headers.length
  );
  bodyRange
    .setFontFamily("Inter")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  // Timestamp number format nếu có cột Timestamp/Updated
  var tsColumns = headers
    .map(function (h, i) {
      var n = h.toLowerCase();
      if (
        n.indexOf("timestamp") >= 0 ||
        n.indexOf("updated") >= 0 ||
        n.indexOf("time") >= 0
      ) {
        return i + 1;
      }
      return -1;
    })
    .filter(function (x) {
      return x > 0;
    });
  tsColumns.forEach(function (col) {
    sheet.getRange(2, col, 1000, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  });

  // Gridlines & alternating colors
  sheet.setHiddenGridlines(false);
  try {
    var banding = sheet.getBandings();
    banding.forEach(function (b) {
      b.remove();
    });
    sheet
      .getRange(2, 1, 1000, headers.length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY)
      .setHeaderRowColor("#0EA5E9")
      .setFirstRowColor("#ffffff")
      .setSecondRowColor("#F8FAFC");
  } catch (e) {}
}

/**
 * CF cho các sheet log: tô màu theo Status/Action
 */
function applyConditionalFormatting(sheet) {
  if (!sheet) return;
  var rules = sheet.getConditionalFormatRules();
  rules = [];

  // Status: SUCCESS (xanh)
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("SUCCESS")
      .setBackground("#DCFCE7")
      .setFontColor("#166534")
      .setRanges([sheet.getRange("E2:E")])
      .build()
  );

  // Status: FAILED/ERROR (đỏ)
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("FAIL")
      .setBackground("#FEE2E2")
      .setFontColor("#991B1B")
      .setRanges([sheet.getRange("E2:E")])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("ERROR")
      .setBackground("#FEE2E2")
      .setFontColor("#991B1B")
      .setRanges([sheet.getRange("E2:E")])
      .build()
  );

  // Action: LOGIN/LOGOUT (xanh nhạt)
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("LOGIN")
      .setBackground("#DBEAFE")
      .setRanges([sheet.getRange("B2:B")])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("LOGOUT")
      .setBackground("#E0E7FF")
      .setRanges([sheet.getRange("B2:B")])
      .build()
  );

  sheet.setConditionalFormatRules(rules);
}

/**
 * Menu tiện ích trong Spreadsheet
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("MIA Warehouse")
    .addItem("Setup sheets (create/update)", "setupWarehouseSheets")
    .addToUi();
}
