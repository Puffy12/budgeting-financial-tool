/**
 * Categories Routes
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
 * GET /api/users/:userId/categories - List all categories for a user
 */
router.get('/', (req, res) => {
  try {
    const categories = db.getAll('categories', req.params.userId);
    res.json(categories);
  } catch (error) {
    console.error('Error listing categories:', error);
    res.status(500).json({ error: 'Failed to list categories' });
  }
});

/**
 * GET /api/users/:userId/categories/:categoryId - Get a specific category
 */
router.get('/:categoryId', (req, res) => {
  try {
    const category = db.getById('categories', req.params.categoryId, req.params.userId);
    
    if (!category || category.userId !== req.params.userId) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

/**
 * POST /api/users/:userId/categories - Create a new category
 */
router.post('/', (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const userId = req.params.userId;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "income" or "expense"' });
    }
    
    const now = new Date().toISOString();
    
    const category = {
      id: uuidv4(),
      userId: userId,
      name: name.trim(),
      type,
      icon: icon || (type === 'expense' ? '📋' : '💰'),
      createdAt: now,
      updatedAt: now
    };
    
    db.insert('categories', category, userId);
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

/**
 * PUT /api/users/:userId/categories/:categoryId - Update a category
 */
router.put('/:categoryId', (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const userId = req.params.userId;
    
    const existingCategory = db.getById('categories', req.params.categoryId, userId);
    
    if (!existingCategory || existingCategory.userId !== userId) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updates = {};
    
    if (name && name.trim()) {
      updates.name = name.trim();
    }
    
    if (type && ['income', 'expense'].includes(type)) {
      updates.type = type;
    }
    
    if (icon) {
      updates.icon = icon;
    }
    
    const category = db.update('categories', req.params.categoryId, updates, userId);
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

/**
 * DELETE /api/users/:userId/categories/:categoryId - Delete a category
 */
router.delete('/:categoryId', (req, res) => {
  try {
    const userId = req.params.userId;
    const category = db.getById('categories', req.params.categoryId, userId);
    
    if (!category || category.userId !== userId) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if category is used by any transactions
    const transactions = db.getAll('transactions', userId);
    const usedByTransactions = transactions.some(t => t.categoryId === req.params.categoryId);
    
    // Check if category is used by any recurring
    const recurring = db.getAll('recurring', userId);
    const usedByRecurring = recurring.some(r => r.categoryId === req.params.categoryId);
    
    if (usedByTransactions || usedByRecurring) {
      return res.status(400).json({ 
        error: 'Category is in use',
        message: 'This category is used by existing transactions or recurring items. Please reassign them first.'
      });
    }
    
    db.remove('categories', req.params.categoryId, userId);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
