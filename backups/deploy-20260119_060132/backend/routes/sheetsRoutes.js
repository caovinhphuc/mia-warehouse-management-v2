/**
 * Google Sheets Routes - Backend API endpoints
 */

const express = require("express");
const router = express.Router();
const googleSheetsService = require("../services/googleSheetsService");

// GET /api/sheets/metadata/:sheetId? - Get sheet metadata
// Also supports ?sheetId=xxx query parameter
router.get("/metadata/:sheetId?", async (req, res) => {
  try {
    const sheetId = req.params.sheetId || req.query.sheetId || null;
    const metadata = await googleSheetsService.getSheetMetadata(sheetId);

    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error("Error getting sheet metadata:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get sheet metadata",
    });
  }
});

// GET /api/sheets/read - Read data from sheet
router.get("/read", async (req, res) => {
  try {
    const { range = "A1:Z1000", sheetId } = req.query;

    if (!range) {
      return res.status(400).json({
        success: false,
        error: "Range parameter is required",
      });
    }

    const result = await googleSheetsService.readSheet(range, sheetId);

    res.json({
      success: true,
      data: result.data,
      range: result.range,
      majorDimension: result.majorDimension,
    });
  } catch (error) {
    console.error("Error reading sheet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to read sheet",
    });
  }
});

// POST /api/sheets/write - Write data to sheet
router.post("/write", async (req, res) => {
  try {
    const { range, values, sheetId } = req.body;

    if (!range || !values) {
      return res.status(400).json({
        success: false,
        error: "Range and values are required",
      });
    }

    const result = await googleSheetsService.writeSheet(range, values, sheetId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error writing to sheet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to write to sheet",
    });
  }
});

// POST /api/sheets/append - Append data to sheet
router.post("/append", async (req, res) => {
  try {
    const { range, values, sheetId } = req.body;

    if (!range || !values) {
      return res.status(400).json({
        success: false,
        error: "Range and values are required",
      });
    }

    const result = await googleSheetsService.appendToSheet(
      range,
      values,
      sheetId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error appending to sheet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to append to sheet",
    });
  }
});

// DELETE /api/sheets/clear - Clear sheet data
router.delete("/clear", async (req, res) => {
  try {
    const { range, sheetId } = req.body;

    if (!range) {
      return res.status(400).json({
        success: false,
        error: "Range parameter is required",
      });
    }

    const result = await googleSheetsService.clearSheet(range, sheetId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error clearing sheet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to clear sheet",
    });
  }
});

// POST /api/sheets/add-sheet - Add new worksheet to spreadsheet
router.post("/add-sheet", async (req, res) => {
  console.log("📥 POST /api/sheets/add-sheet - Request received");
  console.log("📋 Body:", req.body);

  try {
    const { sheetName, sheetId } = req.body;

    if (!sheetName || !sheetName.trim()) {
      console.log("❌ Validation failed: Sheet name is required");
      return res.status(400).json({
        success: false,
        error: "Sheet name is required",
      });
    }

    console.log(
      `📊 Creating sheet: "${sheetName.trim()}" in spreadsheet: ${
        sheetId || "default"
      }`
    );
    const result = await googleSheetsService.addSheet(sheetName, sheetId);

    console.log("✅ Sheet created successfully:", result);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error adding sheet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add sheet",
    });
  }
});

module.exports = router;
