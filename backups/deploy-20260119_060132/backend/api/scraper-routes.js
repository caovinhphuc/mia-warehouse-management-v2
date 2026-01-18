// warehouse-main/backend/api/scraper-routes.js
const express = require('express');
const router = express.Router();
const scraperController = require('./scraper-controller');
const dataReceiver = require('./data-receiver');

/**
 * Scraper Control Routes
 */

// Trigger a scraper
router.post('/scraper/trigger', (req, res) => {
  scraperController.triggerScraper(req, res);
});

// Get scraper status
router.get('/scraper/status', (req, res) => {
  scraperController.getStatus(req, res);
});

// Update schedule configuration
router.post('/scraper/schedule', (req, res) => {
  scraperController.updateSchedule(req, res);
});

// Get latest scraped data from files
router.get('/scraper/data/:type', (req, res) => {
  scraperController.getData(req, res);
});

/**
 * Data Receiver Routes
 */

// Receive data from Python scrapers
router.post('/data/receive', (req, res) => {
  dataReceiver.receiveData(req, res);
});

// Get latest data from Google Sheets
router.get('/data/:type', (req, res) => {
  dataReceiver.getLatestData(req, res);
});

module.exports = router;
