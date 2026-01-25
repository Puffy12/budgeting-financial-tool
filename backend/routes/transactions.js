/**
 * Transactions Routes
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

/**
 * Middleware to validate user exists
 */
function validateUser(req, res, next) {
  if (!db.userExists(req.params.userId)) {
    return res.status(404).json({ error: 'User not found' });
  }
  next();
}

router.use(validateUser);

/**
 * GET /api/users/:userId/transactions - List all transactions for a user
 * Query params: month, year, type, categoryId, limit, offset
 */
router.get('/', (req, res) => {
  try {
    const userId = req.params.userId;
    let transactions = db.getAll('transactions', userId);
    const { month, year, type, categoryId, startDate, endDate, limit, offset } = req.query;
    
    // Filter by month/year
    if (month !== undefined && year !== undefined) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === m && date.getFullYear() === y;
      });
    } else if (year !== undefined) {
      const y = parseInt(year, 10);
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === y;
      });
    }
    
    // Filter by date range
    if (startDate) {
      transactions = transactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter(t => t.date <= endDate);
    }
    
    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    // Filter by category
    if (categoryId) {
      transactions = transactions.filter(t => t.categoryId === categoryId);
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination
    const total = transactions.length;
    if (limit !== undefined) {
      const l = parseInt(limit, 10);
      const o = parseInt(offset, 10) || 0;
      transactions = transactions.slice(o, o + l);
    }
    
    // Include category info
    const categories = db.getAll('categories', userId);
    const transactionsWithCategory = transactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return {
        ...t,
        category: category ? { id: category.id, name: category.name, icon: category.icon } : null
      };
    });
    
    res.json({
      transactions: transactionsWithCategory,
      total,
      limit: limit ? parseInt(limit, 10) : total,
      offset: parseInt(offset, 10) || 0
    });
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

/**
 * GET /api/users/:userId/transactions/:transactionId - Get a specific transaction
 */
router.get('/:transactionId', (req, res) => {
  try {
    const userId = req.params.userId;
    const transaction = db.getById('transactions', req.params.transactionId, userId);
    
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Include category info
    const category = db.getById('categories', transaction.categoryId, userId);
    
    res.json({
      ...transaction,
      category: category ? { id: category.id, name: category.name, icon: category.icon } : null
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

/**
 * POST /api/users/:userId/transactions - Create a new transaction
 */
router.post('/', (req, res) => {
  try {
    const { amount, type, categoryId, date, notes } = req.body;
    const userId = req.params.userId;
    
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "income" or "expense"' });
    }
    
    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }
    
    // Validate category exists and belongs to user
    const category = db.getById('categories', categoryId, userId);
    if (!category || category.userId !== userId) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const now = new Date().toISOString();
    
    const transaction = {
      id: uuidv4(),
      userId: userId,
      categoryId,
      amount: parseFloat(amount),
      type,
      date: date || now.split('T')[0],
      notes: notes || '',
      isRecurring: false,
      recurringId: null,
      createdAt: now,
      updatedAt: now
    };
    
    db.insert('transactions', transaction, userId);
    
    res.status(201).json({
      ...transaction,
      category: { id: category.id, name: category.name, icon: category.icon }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

/**
 * PUT /api/users/:userId/transactions/:transactionId - Update a transaction
 */
router.put('/:transactionId', (req, res) => {
  try {
    const { amount, type, categoryId, date, notes } = req.body;
    const userId = req.params.userId;
    
    const existingTransaction = db.getById('transactions', req.params.transactionId, userId);
    
    if (!existingTransaction || existingTransaction.userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const updates = {};
    
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      updates.amount = parseFloat(amount);
    }
    
    if (type && ['income', 'expense'].includes(type)) {
      updates.type = type;
    }
    
    if (categoryId) {
      const category = db.getById('categories', categoryId, userId);
      if (!category || category.userId !== userId) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      updates.categoryId = categoryId;
    }
    
    if (date) {
      updates.date = date;
    }
    
    if (notes !== undefined) {
      updates.notes = notes;
    }
    
    const transaction = db.update('transactions', req.params.transactionId, updates, userId);
    
    // Include category info
    const category = db.getById('categories', transaction.categoryId, userId);
    
    res.json({
      ...transaction,
      category: category ? { id: category.id, name: category.name, icon: category.icon } : null
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

/**
 * DELETE /api/users/:userId/transactions/:transactionId - Delete a transaction
 */
router.delete('/:transactionId', (req, res) => {
  try {
    const userId = req.params.userId;
    const transaction = db.getById('transactions', req.params.transactionId, userId);
    
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    db.remove('transactions', req.params.transactionId, userId);
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
