const express = require('express');
const router = express.Router();
const db = require('../db');
const { validateBody } = require('../middleware/validate');
const { updateUserSchema } = require('../validation/schemas');
const { requireOwnership } = require('../middleware/pinAuth');
const { buildSummary, buildMonthly, buildComparison } = require('../services/userStats');
const { sanitizeUser } = require('../services/auth');

router.get('/', (req, res) => {
  try {
    const user = db.getUserById(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { pinHash, ...safeUser } = user;
    res.json([safeUser]);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

router.get('/:userId', requireOwnership, (req, res) => {
  try {
    const user = db.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/:userId', requireOwnership, validateBody(updateUserSchema), (req, res) => {
  try {
    const user = db.updateUser(req.params.userId, { name: req.body.name });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:userId', requireOwnership, (req, res) => {
  try {
    if (req.get('X-Confirm-Delete') !== 'true') {
      return res.status(400).json({
        error: 'Missing X-Confirm-Delete header. This action permanently deletes all user data.',
      });
    }
    const user = db.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    db.deleteUser(req.params.userId);
    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/:userId/stats/summary', requireOwnership, (req, res) => {
  try {
    if (!db.userExists(req.params.userId)) return res.status(404).json({ error: 'User not found' });
    res.json(buildSummary(req.params.userId, req.query));
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

router.get('/:userId/stats/monthly', requireOwnership, (req, res) => {
  try {
    if (!db.userExists(req.params.userId)) return res.status(404).json({ error: 'User not found' });
    res.json(buildMonthly(req.params.userId, req.query));
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    res.status(500).json({ error: 'Failed to get monthly stats' });
  }
});

router.get('/:userId/stats/comparison', requireOwnership, (req, res) => {
  try {
    if (!db.userExists(req.params.userId)) return res.status(404).json({ error: 'User not found' });
    res.json(buildComparison(req.params.userId, req.query));
  } catch (error) {
    console.error('Error getting comparison:', error);
    res.status(500).json({ error: 'Failed to get comparison' });
  }
});

module.exports = router;
