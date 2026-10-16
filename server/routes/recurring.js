const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const { validateBody } = require('../middleware/validate');
const { createRecurringSchema, updateRecurringSchema } = require('../validation/schemas');
const recurring = require('../services/recurring');

function validateUser(req, res, next) {
  if (!db.userExists(req.params.userId)) return res.status(404).json({ error: 'User not found' });
  next();
}

function send(res, result) {
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.body);
}

router.use(validateUser);

router.get('/', (req, res) => {
  try {
    res.json(recurring.listRecurring(req.params.userId, req.query));
  } catch (error) {
    console.error('Error listing recurring:', error);
    res.status(500).json({ error: 'Failed to list recurring transactions' });
  }
});

router.get('/:recurringId', (req, res) => {
  try {
    const item = recurring.getRecurring(req.params.userId, req.params.recurringId);
    if (!item) return res.status(404).json({ error: 'Recurring transaction not found' });
    res.json(item);
  } catch (error) {
    console.error('Error getting recurring:', error);
    res.status(500).json({ error: 'Failed to get recurring transaction' });
  }
});

router.post('/', validateBody(createRecurringSchema), (req, res) => {
  try {
    send(res, recurring.createRecurring(req.params.userId, req.body));
  } catch (error) {
    console.error('Error creating recurring:', error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
});

router.put('/:recurringId', validateBody(updateRecurringSchema), (req, res) => {
  try {
    send(res, recurring.updateRecurring(req.params.userId, req.params.recurringId, req.body));
  } catch (error) {
    console.error('Error updating recurring:', error);
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
});

router.delete('/:recurringId', (req, res) => {
  try {
    send(res, recurring.deleteRecurring(req.params.userId, req.params.recurringId));
  } catch (error) {
    console.error('Error deleting recurring:', error);
    res.status(500).json({ error: 'Failed to delete recurring transaction' });
  }
});

router.post('/:recurringId/process', (req, res) => {
  try {
    send(res, recurring.processRecurring(req.params.userId, req.params.recurringId));
  } catch (error) {
    console.error('Error processing recurring:', error);
    res.status(500).json({ error: 'Failed to process recurring transaction' });
  }
});

module.exports = router;
