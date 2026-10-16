const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const { buildFullExport, buildMonthExport } = require('../services/exportBuilders');
const { buildYearExport } = require('../services/exportYear');
const { importUserData } = require('../services/importData');

function validateUser(req, res, next) {
  if (!db.userExists(req.params.userId)) return res.status(404).json({ error: 'User not found' });
  next();
}

function sendDownload(res, result) {
  if (result.error) return res.status(result.status).json({ error: result.error });
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  return res.json(result.body);
}

router.use(validateUser);

router.get('/export', (req, res) => {
  try {
    sendDownload(res, buildFullExport(req.params.userId));
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

router.get('/export/month/:year/:month', (req, res) => {
  try {
    sendDownload(res, buildMonthExport(req.params.userId, req.params.year, req.params.month));
  } catch (error) {
    console.error('Error exporting monthly data:', error);
    res.status(500).json({ error: 'Failed to export monthly data' });
  }
});

router.get('/export/year/:year', (req, res) => {
  try {
    sendDownload(res, buildYearExport(req.params.userId, req.params.year));
  } catch (error) {
    console.error('Error exporting yearly data:', error);
    res.status(500).json({ error: 'Failed to export yearly data' });
  }
});

router.post('/import', (req, res) => {
  try {
    const result = importUserData(req.params.userId, req.body);
    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json(result.body);
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;
