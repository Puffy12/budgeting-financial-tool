/**
 * Recurring Transactions Routes
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const { processSpecificRecurring } = require('../utils/recurringProcessor');

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
 * GET /api/users/:userId/recurring - List all recurring transactions for a user
 */
router.get('/', (req, res) => {
  try {
    const userId = req.params.userId;
    let recurring = db.getAll('recurring', userId);
    const { type, isActive } = req.query;
    
    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      recurring = recurring.filter(r => r.type === type);
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      const active = isActive === 'true';
      recurring = recurring.filter(r => r.isActive === active);
    }
    
    // Sort by next due date
    recurring.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
    
    // Include category info
    const categories = db.getAll('categories', userId);
    const recurringWithCategory = recurring.map(r => {
      const category = categories.find(c => c.id === r.categoryId);
      return {
        ...r,
        category: category ? { id: category.id, name: category.name, icon: category.icon } : null
      };
    });
    
    res.json(recurringWithCategory);
  } catch (error) {
    console.error('Error listing recurring:', error);
    res.status(500).json({ error: 'Failed to list recurring transactions' });
  }
});

/**
 * GET /api/users/:userId/recurring/:recurringId - Get a specific recurring transaction
 */
router.get('/:recurringId', (req, res) => {
  try {
    const userId = req.params.userId;
    const recurring = db.getById('recurring', req.params.recurringId, userId);
    
    if (!recurring || recurring.userId !== userId) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }
    
    // Include category info
    const category = db.getById('categories', recurring.categoryId, userId);
    
    res.json({
      ...recurring,
      category: category ? { id: category.id, name: category.name, icon: category.icon } : null
    });
  } catch (error) {
    console.error('Error getting recurring:', error);
    res.status(500).json({ error: 'Failed to get recurring transaction' });
  }
});

/**
 * POST /api/users/:userId/recurring - Create a new recurring transaction
 */
router.post('/', (req, res) => {
  try {
    const { name, amount, type, categoryId, frequency, startDate, notes } = req.body;
    const userId = req.params.userId;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "income" or "expense"' });
    }
    
    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }
    
    if (!frequency || !['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'].includes(frequency)) {
      return res.status(400).json({ error: 'Frequency must be weekly, biweekly, monthly, quarterly, or yearly' });
    }
    
    // Validate category exists and belongs to user
    const category = db.getById('categories', categoryId, userId);
    if (!category || category.userId !== userId) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const now = new Date().toISOString();
    const start = startDate || now.split('T')[0];
    
    const recurring = {
      id: uuidv4(),
      userId: userId,
      name: name.trim(),
      categoryId,
      amount: parseFloat(amount),
      type,
      frequency,
      startDate: start,
      nextDueDate: start,
      notes: notes || '',
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    
    db.insert('recurring', recurring, userId);
    
    res.status(201).json({
      ...recurring,
      category: { id: category.id, name: category.name, icon: category.icon }
    });
  } catch (error) {
    console.error('Error creating recurring:', error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
});

/**
 * PUT /api/users/:userId/recurring/:recurringId - Update a recurring transaction
 */
router.put('/:recurringId', (req, res) => {
  try {
    const { name, amount, type, categoryId, frequency, nextDueDate, notes, isActive } = req.body;
    const userId = req.params.userId;
    
    const existingRecurring = db.getById('recurring', req.params.recurringId, userId);
    
    if (!existingRecurring || existingRecurring.userId !== userId) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }
    
    const updates = {};
    
    if (name && name.trim()) {
      updates.name = name.trim();
    }
    
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
    
    if (frequency && ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'].includes(frequency)) {
      updates.frequency = frequency;
    }
    
    if (nextDueDate) {
      updates.nextDueDate = nextDueDate;
    }
    
    if (notes !== undefined) {
      updates.notes = notes;
    }
    
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }
    
    const recurring = db.update('recurring', req.params.recurringId, updates, userId);
    
    // Include category info
    const category = db.getById('categories', recurring.categoryId, userId);
    
    res.json({
      ...recurring,
      category: category ? { id: category.id, name: category.name, icon: category.icon } : null
    });
  } catch (error) {
    console.error('Error updating recurring:', error);
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
});

/**
 * DELETE /api/users/:userId/recurring/:recurringId - Delete a recurring transaction
 */
router.delete('/:recurringId', (req, res) => {
  try {
    const userId = req.params.userId;
    const recurring = db.getById('recurring', req.params.recurringId, userId);
    
    if (!recurring || recurring.userId !== userId) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }
    
    db.remove('recurring', req.params.recurringId, userId);
    
    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring:', error);
    res.status(500).json({ error: 'Failed to delete recurring transaction' });
  }
});

/**
 * POST /api/users/:userId/recurring/:recurringId/process - Manually process a recurring transaction
 */
router.post('/:recurringId/process', (req, res) => {
  try {
    const userId = req.params.userId;
    const result = processSpecificRecurring(req.params.recurringId, userId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ 
      message: 'Recurring transaction processed successfully',
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Error processing recurring:', error);
    res.status(500).json({ error: 'Failed to process recurring transaction' });
  }
});

module.exports = router;
