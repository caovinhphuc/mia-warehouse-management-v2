// Test Google Sheets connection
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_API_KEY;

async function testConnection() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.spreadsheetId) {
      console.log('✅ Kết nối thành công!');
      console.log('📊 Spreadsheet:', data.properties.title);
      console.log('📄 Sheets:', data.sheets.map(s => s.properties.title).join(', '));
    } else {
      console.log('❌ Kết nối thất bại:', data.error?.message);
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }
}

testConnection();
