// warehouse-main/backend/api/scraper-controller.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class ScraperController {
  constructor() {
    this.pythonPath = '/usr/local/bin/python3';
    this.automationDir = path.join(process.env.HOME, 'Workspace/mia-vn/automation');
    this.runningJobs = new Map();
  }

  /**
   * Trigger a Python scraper
   */
  async triggerScraper(req, res) {
    const { type } = req.body;
    
    const scriptMap = {
      'so': 'automation_by_date.py',
      'inventory': 'automation_inventory.py',
      'po': 'automation_po.py',
      'ck': 'automation_ck.py'
    };

    const scriptName = scriptMap[type];
    if (!scriptName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid scraper type'
      });
    }

    // Check if already running
    if (this.runningJobs.has(type)) {
      return res.status(409).json({
        success: false,
        error: 'Scraper already running'
      });
    }

    const scriptPath = path.join(this.automationDir, scriptName);
    const command = `${this.pythonPath} ${scriptPath}`;

    console.log(`🚀 Triggering scraper: ${type}`);
    console.log(`   Command: ${command}`);

    this.runningJobs.set(type, { startTime: new Date(), status: 'running' });

    exec(command, { cwd: this.automationDir }, (error, stdout, stderr) => {
      this.runningJobs.delete(type);

      if (error) {
        console.error(`❌ Scraper error (${type}):`, error);
        return res.status(500).json({
          success: false,
          error: error.message,
          stderr
        });
      }

      console.log(`✅ Scraper completed (${type})`);
      res.json({
        success: true,
        message: `${type} scraper completed`,
        stdout,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Get scraper status
   */
  async getStatus(req, res) {
    const statuses = {};
    
    for (const [type, job] of this.runningJobs.entries()) {
      statuses[type] = {
        status: 'running',
        startTime: job.startTime,
        duration: Date.now() - job.startTime.getTime()
      };
    }

    res.json({
      success: true,
      running: statuses,
      count: this.runningJobs.size
    });
  }

  /**
   * Update schedule configuration
   */
  async updateSchedule(req, res) {
    const scheduleConfig = req.body;
    
    try {
      const configPath = path.join(this.automationDir, 'config', 'schedule.json');
      await fs.writeFile(configPath, JSON.stringify(scheduleConfig, null, 2));
      
      // TODO: Restart cron jobs with new config
      
      res.json({
        success: true,
        message: 'Schedule configuration updated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get latest scraped data
   */
  async getData(req, res) {
    const { type } = req.params;
    
    try {
      const dataDir = path.join(this.automationDir, 'data');
      const files = await fs.readdir(dataDir);
      
      // Find latest file for this type
      const pattern = new RegExp(`${type}.*\\.(json|csv)$`);
      const matchingFiles = files.filter(f => pattern.test(f));
      
      if (matchingFiles.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: 'No data available'
        });
      }

      // Get newest file
      const latestFile = matchingFiles.sort().reverse()[0];
      const filePath = path.join(dataDir, latestFile);
      
      let data;
      if (latestFile.endsWith('.json')) {
        const content = await fs.readFile(filePath, 'utf8');
        data = JSON.parse(content);
      } else if (latestFile.endsWith('.csv')) {
        // TODO: Parse CSV
        data = [];
      }

      res.json({
        success: true,
        data,
        file: latestFile,
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

module.exports = new ScraperController();
