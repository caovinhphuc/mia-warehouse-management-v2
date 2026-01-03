/**
 * 🚀 MIA WAREHOUSE MANAGEMENT - SIMPLIFIED APPS SCRIPT FOR AUDIT LOGGING
 * Compatible với frontend logAuditEvent() function
 */

const SPREADSHEET_ID = "1m2B2ODXuuatnW0EKExdVeCa1WwvF52bZOhS7DGqG6Vg";

/**
 * Handle GET requests for testing
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      message: "🏭 MIA Warehouse Apps Script is working!",
      timestamp: new Date().toISOString(),
      version: "1.0 - Audit Logging",
      endpoint:
        "AKfycbxSt8QUiny3-a_iW_-W50GUteSpERWj1ddma3TMH1y1V5UQfY4bswhVZ1o7Aj3FE_UZ",
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests for audit logging
 */
function doPost(e) {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    // Parse request data
    const requestData = JSON.parse(e.postData.contents);
    console.log("Received data:", requestData);

    // Get spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Get AuditLog sheet (create if not exists)
    let auditSheet = ss.getSheetByName("AuditLog");
    if (!auditSheet) {
      auditSheet = ss.insertSheet("AuditLog");
      // Add headers
      auditSheet.appendRow([
        "Timestamp",
        "Action",
        "Username",
        "Details",
        "Status",
        "IP Address",
      ]);
    }

    // Prepare data for AuditLog sheet
    const rowData = [
      requestData.timestamp || new Date().toISOString(),
      requestData.action || "UNKNOWN",
      requestData.username || "unknown",
      requestData.details || "",
      requestData.status || "SUCCESS",
      requestData.ipAddress || "unknown",
    ];

    // Append to AuditLog sheet
    auditSheet.appendRow(rowData);

    // Also log to LoginLog sheet if it's a login/logout action
    if (
      requestData.action &&
      (requestData.action.includes("LOGIN") ||
        requestData.action.includes("LOGOUT"))
    ) {
      let loginSheet = ss.getSheetByName("LoginLog");
      if (!loginSheet) {
        loginSheet = ss.insertSheet("LoginLog");
        // Add headers
        loginSheet.appendRow([
          "Timestamp",
          "Action",
          "Username",
          "Details",
          "Status",
          "IP Address",
          "Session ID",
        ]);
      }

      loginSheet.appendRow([...rowData, requestData.sessionId || ""]);
    }

    console.log("Successfully logged to sheets:", rowData);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Activity logged successfully",
        timestamp: new Date().toISOString(),
        action: requestData.action,
        sheetsUpdated: ["AuditLog"],
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doPost:", error);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
function doOptions(e) {
  return ContentService.createTextOutput("").setHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}
