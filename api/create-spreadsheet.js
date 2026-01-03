// Vercel Serverless Function: POST /api/create-spreadsheet
// Tạo Spreadsheet mới + cấu trúc sheet chuẩn, trả về spreadsheetId

const { google } = require("googleapis");

function getAuth(drive = false) {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_SA_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  );
  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_SA_CLIENT_EMAIL or GOOGLE_SA_PRIVATE_KEY");
  }
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ];
  return new google.auth.JWT({ email: clientEmail, key: privateKey, scopes });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }
  try {
    const {
      name = "MIA Warehouse " + new Date().toISOString(),
      parentFolderId,
    } = req.body || {};

    const auth = getAuth(true);
    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    // 1) Create spreadsheet file
    const file = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.spreadsheet",
        parents: parentFolderId ? [parentFolderId] : undefined,
      },
      fields: "id",
    });
    const spreadsheetId = file.data.id;

    // 2) Batch update to create tabs
    const tabs = [
      "Users",
      "AuditLog",
      "LoginLog",
      "Sessions",
      "Inventory",
      "Transactions",
      "Locations",
      "Dashboard",
      "Permissions",
    ];

    // Remove default sheet then add ours
    const ss = await sheets.spreadsheets.get({ spreadsheetId });
    const defaultSheetId = ss.data.sheets?.[0]?.properties?.sheetId;
    const requests = [];
    if (typeof defaultSheetId === "number") {
      requests.push({ deleteSheet: { sheetId: defaultSheetId } });
    }
    tabs.forEach((title) =>
      requests.push({ addSheet: { properties: { title } } })
    );

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    return res.status(200).json({ success: true, spreadsheetId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
