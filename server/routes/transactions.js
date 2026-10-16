const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const { validateBody } = require('../middleware/validate');
const { createTransactionSchema, updateTransactionSchema } = require('../validation/schemas');
const transactions = require('../services/transactions');

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
    res.json(transactions.listTransactions(req.params.userId, req.query));
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

router.get('/:transactionId', (req, res) => {
  try {
    const transaction = transactions.getTransaction(req.params.userId, req.params.transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

router.post('/', validateBody(createTransactionSchema), (req, res) => {
  try {
    send(res, transactions.createTransaction(req.params.userId, req.body));
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.put('/:transactionId', validateBody(updateTransactionSchema), (req, res) => {
  try {
    send(res, transactions.updateTransaction(req.params.userId, req.params.transactionId, req.body));
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.delete('/:transactionId', (req, res) => {
  try {
    send(res, transactions.deleteTransaction(req.params.userId, req.params.transactionId));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
