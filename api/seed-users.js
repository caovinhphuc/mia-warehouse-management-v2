// Vercel Serverless Function: GET/POST /api/seed-users
// Tạo tài khoản mẫu (admin) nếu sheet Users đang trống hoặc chưa có user tương ứng

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
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const usersSheet = process.env.USERS_SHEET_NAME || "Users";

    if (!spreadsheetId)
      return res
        .status(400)
        .json({ success: false, error: "Missing GOOGLE_SHEETS_ID" });

    // Đọc dữ liệu hiện tại
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${usersSheet}!A:Z`,
    });
    const rows = read.data.values || [];

    // Xác định header
    let headers = [];
    if (rows.length > 0) headers = rows[0];
    const nowIso = new Date().toISOString();

    // Lấy dữ liệu seed từ query (GET) hoặc body (POST)
    const qp = req.method === 'GET' ? (req.query || {}) : (req.body || {});
    const sample = {
      username: (qp.username || 'admin').toString(),
      password: (qp.password || '123456').toString(),
      fullName: (qp.fullName || 'System Admin').toString(),
      email: (qp.email || 'admin@mia.local').toString(),
      role: (qp.role || 'Admin').toString(),
      department: (qp.department || 'Operations').toString(),
      permissions: (qp.permissions || 'read_orders,write_orders,admin').toString(),
      shift: (qp.shift || 'Day').toString(),
      updated: nowIso,
    };

    // Nếu sheet mới chỉ có header hoặc rỗng → append admin
    const existing = rows
      .slice(1)
      .find((r) => (r[0] || "").toLowerCase() === sample.username);
    if (!existing) {
      // Bảo đảm đúng thứ tự cột A..I theo header nếu có, nếu không thì theo mặc định 9 cột
      const cols = [
        sample.username,
        sample.password,
        sample.fullName,
        sample.email,
        sample.role,
        sample.department,
        sample.permissions,
        sample.shift,
        sample.updated,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${usersSheet}!A:I`,
        valueInputOption: "RAW",
        requestBody: { values: [cols] },
      });
    }

    return res
      .status(200)
      .json({
        success: true,
        createdAdmin: !existing,
        username: sample.username,
      });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
