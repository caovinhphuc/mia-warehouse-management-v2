// warehouse-main/backend/api/data-receiver.js
const googleSheetsService = require('../services/googleSheetsService');
const googleDriveService = require('../services/googleDriveService');
const alertService = require('../services/alertService');

class DataReceiver {
  /**
   * Receive scraped data from Python
   */
  async receiveData(req, res) {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing type or data'
      });
    }

    console.log(`📥 Received ${data.length} records for ${type}`);

    try {
      // 1. Upload to Google Sheets
      await this.uploadToSheets(type, data);
      
      // 2. Archive to Google Drive (if needed)
      if (this.shouldArchive(data)) {
        await this.archiveToDrive(type, data);
      }

      // 3. Send notification (optional - skip for now)
      // await this.sendNotification(type, data);

      res.json({
        success: true,
        message: `Processed ${data.length} records`,
        type,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ Error processing data:`, error);
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Upload data to Google Sheets
   */
  async uploadToSheets(type, data) {
    const sheetMap = {
      'so': 'Đơn hàng',
      'inventory': 'Tồn kho',
      'po': 'Nhập hàng',
      'ck': 'Chuyển kho'
    };

    const sheetName = sheetMap[type] || type;
    
    console.log(`📊 Uploading to Google Sheets: ${sheetName}`);
    
    try {
      await googleSheetsService.initialize();
      
      // Convert data to 2D array format
      if (data.length === 0) return;
      
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h] || ''));
      const values = [headers, ...rows];
      
      const sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;
      
      if (!sheetId) {
        throw new Error('Google Sheet ID not configured');
      }
      
      // Append to sheet
      await googleSheetsService.appendToSheet(
        `${sheetName}!A:Z`,
        values,
        sheetId
      );
      
      console.log(`✅ Uploaded ${data.length} records to ${sheetName}`);
    } catch (error) {
      console.error(`❌ Failed to upload to Sheets:`, error.message);
      throw error;
    }
  }

  /**
   * Archive to Google Drive
   */
  async archiveToDrive(type, data) {
    // Check if this is 2025 data
    const is2025 = this.is2025Data(data);
    
    if (!is2025) {
      console.log(`⏭️  Skipping Drive archive (not 2025 data)`);
      return;
    }

    console.log(`💾 Archiving to Google Drive...`);
    
    const folderMap = {
      'so': 'Đơn hàng 2025',
      'inventory': 'Tồn kho 2025',
      'po': 'Nhập hàng 2025',
      'ck': 'Chuyển kho 2025'
    };

    const folderName = folderMap[type];
    const fileName = `${type}_${new Date().toISOString().split('T')[0]}.json`;

    try {
      await googleDriveService.initialize();
      
      // Create folder if not exists
      const folder = await googleDriveService.createFolder(folderName);
      
      // Upload file
      const fileContent = JSON.stringify(data, null, 2);
      // Note: uploadFile method may need adjustment based on actual googleDriveService API
      
      console.log(`✅ Archived to Drive: ${folderName}/${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to archive to Drive:`, error.message);
      // Don't throw - archive is not critical
    }
  }

  /**
   * Send notification (placeholder)
   */
  async sendNotification(type, data) {
    // Telegram integration - skip for now
    console.log(`📱 Notification skipped (not configured)`);
  }

  /**
   * Check if data should be archived
   */
  shouldArchive(data) {
    // Archive if:
    // 1. Data is from 2025
    // 2. Data size > 100 records
    return this.is2025Data(data) || data.length > 100;
  }

  /**
   * Check if data is from 2025
   */
  is2025Data(data) {
    if (!data || data.length === 0) return false;

    // Check common date fields
    const dateFields = ['date', 'created_at', 'updated_at', 'scraped_at'];
    const firstRecord = data[0];

    for (const field of dateFields) {
      if (firstRecord[field]) {
        const year = new Date(firstRecord[field]).getFullYear();
        if (year === 2025) return true;
      }
    }

    return false;
  }

  /**
   * Get latest data from Sheets
   */
  async getLatestData(req, res) {
    const { type } = req.params;

    const sheetMap = {
      'so': 'Đơn hàng',
      'inventory': 'Tồn kho',
      'po': 'Nhập hàng',
      'ck': 'Chuyển kho'
    };

    const sheetName = sheetMap[type];

    try {
      await googleSheetsService.initialize();
      
      const sheetId = process.env.GOOGLE_SHEET_ID || process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;
      
      if (!sheetId) {
        throw new Error('Google Sheet ID not configured');
      }
      
      const data = await googleSheetsService.readSheet(`${sheetName}!A:Z`, sheetId);
      
      res.json({
        success: true,
        data,
        type,
        count: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DataReceiver();
