const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const { validateBody } = require('../middleware/validate');
const { saveBudgetSchema } = require('../validation/budgets');
const budgets = require('../services/budgets');

router.use((req, res, next) => {
  if (!db.userExists(req.params.userId)) return res.status(404).json({ error: 'User not found' });
  next();
});

router.get('/', (req, res) => {
  try {
    res.json(budgets.listBudgets(req.params.userId));
  } catch (error) {
    console.error('Error listing budgets:', error);
    res.status(500).json({ error: 'Failed to list budgets' });
  }
});

router.put('/', validateBody(saveBudgetSchema), (req, res) => {
  try {
    res.json(budgets.saveBudget(req.params.userId, req.body));
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

module.exports = router;
