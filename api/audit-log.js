// Vercel Serverless Function: POST /api/audit-log
// Ghi log vào Google Sheets bằng Service Account

const { google } = require("googleapis");

function getAuth() {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_SA_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  );
  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_SA_CLIENT_EMAIL or GOOGLE_SA_PRIVATE_KEY");
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }
  try {
    const {
      timestamp = new Date().toISOString(),
      action = "UNKNOWN",
      username = "unknown",
      details = "",
      status = "SUCCESS",
      ipAddress = req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "unknown",
    } = req.body || {};

    const sheets = google.sheets({ version: "v4", auth: getAuth() });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const sheetName = process.env.AUDIT_SHEET_NAME || "AuditLog";

    if (!spreadsheetId) {
      throw new Error("Missing GOOGLE_SHEETS_ID");
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:F`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [timestamp, action, username, details, status, `${ipAddress}`],
        ],
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
