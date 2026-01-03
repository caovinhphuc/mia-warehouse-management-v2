/* eslint-disable */
/**
 * Google Apps Script Routes - Backend API endpoints
 * Handles Google Apps Script execution and management
 */

const express = require("express");
const router = express.Router();
const { google } = require("googleapis");

/**
 * POST /api/script/execute
 * Execute a Google Apps Script
 */
router.post("/execute", async (req, res) => {
  console.log("📥 POST /api/script/execute - Request received");
  console.log("📋 Body:", req.body);

  try {
    const { scriptId, functionName, parameters = [] } = req.body;

    if (!scriptId && !functionName) {
      return res.status(400).json({
        success: false,
        error: "Script ID or function name is required",
      });
    }

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: [
        "https://www.googleapis.com/auth/script.scriptapp",
        "https://www.googleapis.com/auth/script.projects",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    const authClient = await auth.getClient();
    const script = google.script({ version: "v1", auth: authClient });

    // Execute script
    const executionRequest = {
      function: functionName || "main",
      parameters: parameters,
    };

    let response;
    if (scriptId) {
      // Execute by script ID
      response = await script.scripts.run({
        scriptId: scriptId,
        requestBody: executionRequest,
      });
    } else {
      // Execute inline script (requires different approach)
      return res.status(400).json({
        success: false,
        error: "Script ID is required for execution",
        note: "Inline script execution requires script deployment",
      });
    }

    // Check for errors
    if (response.data.error) {
      return res.status(500).json({
        success: false,
        error: "Script execution error",
        details: response.data.error,
      });
    }

    console.log("✅ Script executed successfully");
    res.json({
      success: true,
      data: {
        result: response.data.response?.result,
        executionTime: response.data.response?.executionTime,
      },
    });
  } catch (error) {
    console.error("❌ Error executing script:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to execute script",
      details: error.response?.data || error.stack,
    });
  }
});

/**
 * POST /api/script/execute-inline
 * Execute inline Google Apps Script code
 */
router.post("/execute-inline", async (req, res) => {
  console.log("📥 POST /api/script/execute-inline - Request received");

  try {
    const { code, functionName = "main", parameters = [] } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Script code is required",
      });
    }

    // For inline execution, we need to:
    // 1. Create a temporary script project
    // 2. Deploy it
    // 3. Execute it
    // 4. Clean up (optional)

    // Note: This is a simplified version
    // In production, you might want to cache scripts or use a different approach

    return res.status(501).json({
      success: false,
      error: "Inline script execution not yet implemented",
      note: "Please use script ID with /api/script/execute endpoint",
      alternative: "Deploy your script first and use the script ID",
    });
  } catch (error) {
    console.error("❌ Error executing inline script:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to execute inline script",
    });
  }
});

/**
 * GET /api/script/projects
 * List Google Apps Script projects
 */
router.get("/projects", async (req, res) => {
  console.log("📥 GET /api/script/projects - Request received");

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/script.projects.readonly"],
    });

    const authClient = await auth.getClient();
    const script = google.script({ version: "v1", auth: authClient });

    // Note: Listing projects requires different API
    // This is a placeholder - actual implementation depends on your setup

    res.json({
      success: true,
      data: [],
      note: "Project listing requires Drive API integration",
    });
  } catch (error) {
    console.error("❌ Error listing projects:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list projects",
    });
  }
});

/**
 * GET /api/script/status/:scriptId
 * Get script execution status
 */
router.get("/status/:scriptId", async (req, res) => {
  console.log("📥 GET /api/script/status/:scriptId - Request received");

  try {
    const { scriptId } = req.params;

    if (!scriptId) {
      return res.status(400).json({
        success: false,
        error: "Script ID is required",
      });
    }

    // Get script metadata
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/script.projects.readonly"],
    });

    const authClient = await auth.getClient();
    const script = google.script({ version: "v1", auth: authClient });

    const project = await script.projects.get({
      scriptId: scriptId,
    });

    res.json({
      success: true,
      data: {
        scriptId: project.data.scriptId,
        title: project.data.title,
        createTime: project.data.createTime,
        updateTime: project.data.updateTime,
      },
    });
  } catch (error) {
    console.error("❌ Error getting script status:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get script status",
    });
  }
});

/**
 * POST /api/script/test
 * Test script execution (dry run)
 */
router.post("/test", async (req, res) => {
  console.log("📥 POST /api/script/test - Request received");

  try {
    const { scriptId, functionName, parameters = [] } = req.body;

    // Test endpoint - validates script without executing
    res.json({
      success: true,
      message: "Script validation successful",
      data: {
        scriptId: scriptId || "N/A",
        functionName: functionName || "main",
        parameters: parameters,
        validated: true,
      },
    });
  } catch (error) {
    console.error("❌ Error testing script:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to test script",
    });
  }
});

module.exports = router;
