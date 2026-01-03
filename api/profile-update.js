// Vercel Serverless Function: POST /api/profile-update
// Cập nhật thông tin người dùng trong sheet Users bằng Service Account

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
    const { userId, update = {} } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing userId" });
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const usersSheet = process.env.USERS_SHEET_NAME || "Users";

    // Read header + data
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${usersSheet}!A:Z`,
    });
    const rows = read.data.values || [];
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Users sheet empty" });

    const headers = rows[0];
    const idIndex = 0; // Username cột A
    const updatedColIndex = headers.findIndex(
      (h) => String(h).toLowerCase() === "updated"
    );

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (
        (rows[i][idIndex] || "").toString().toLowerCase() ===
        String(userId).toLowerCase()
      ) {
        rowIndex = i;
        break;
      }
    }
    if (rowIndex === -1)
      return res.status(404).json({ success: false, error: "User not found" });

    const currentRow = rows[rowIndex];
    const updatedRow = [...currentRow];
    Object.keys(update).forEach((key) => {
      const idx = headers.findIndex(
        (h) =>
          String(h).toLowerCase().replace(/\s+/g, "") ===
          String(key).toLowerCase().replace(/\s+/g, "")
      );
      if (idx >= 0) updatedRow[idx] = update[key];
    });
    if (updatedColIndex >= 0)
      updatedRow[updatedColIndex] = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${usersSheet}!A${rowIndex + 1}:Z${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [updatedRow] },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
