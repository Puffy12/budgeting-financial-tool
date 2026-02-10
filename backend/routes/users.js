/**
 * Users Routes
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { validateBody, validateQuery } = require('../middleware/validate');
const { createUserSchema, updateUserSchema, monthlyQuerySchema } = require('../validation/schemas');

/**
 * GET /api/users - List all users
 */
router.get('/', (req, res) => {
  try {
    const users = db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * GET /api/users/:userId - Get a specific user
 */
router.get('/:userId', (req, res) => {
  try {
    const user = db.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * POST /api/users - Create a new user
 */
router.post('/', validateBody(createUserSchema), async (req, res) => {
  try {
    const { name, pin } = req.body;
    
    // Check if user with this name already exists
    const existing = db.getUserByName(name);
    if (existing) {
      return res.status(409).json({ error: 'A user with that name already exists' });
    }
    
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    // Hash the PIN
    const pinHash = await bcrypt.hash(pin, 12);
    
    const user = {
      id: userId,
      name,
      pinHash,
      createdAt: now,
      updatedAt: now
    };
    
    db.insertUser(user);
    
    // Create default categories for the new user
    const defaultCategories = db.getDefaultCategories().map(cat => ({
      id: uuidv4(),
      userId: userId,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      createdAt: now,
      updatedAt: now
    }));
    
    db.insertMany('categories', defaultCategories, userId);
    
    // Return user without pinHash
    const { pinHash: _pinHash, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/users/:userId - Update a user
 */
router.put('/:userId', validateBody(updateUserSchema), (req, res) => {
  try {
    const { name } = req.body;
    
    const user = db.updateUser(req.params.userId, { name });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:userId - Delete a user and all their data
 */
router.delete('/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user (this also deletes their data folder)
    db.deleteUser(userId);
    
    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/users/:userId/stats/summary - Get user's financial summary
 * Query params: month (0-11), year - optional, defaults to server's current date
 * Client should pass these to ensure correct timezone handling
 */
router.get('/:userId/stats/summary', (req, res) => {
  try {
    const userId = req.params.userId;
    const { month, year } = req.query;
    
    if (!db.userExists(userId)) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const transactions = db.getAll('transactions', userId);
    const recurring = db.getAll('recurring', userId).filter(r => r.isActive);
    
    // Use client-provided month/year if available, otherwise use server time
    const now = new Date();
    const currentMonth = month !== undefined ? parseInt(month, 10) : now.getMonth();
    const currentYear = year !== undefined ? parseInt(year, 10) : now.getFullYear();
    
    // Filter transactions for current month - parse date string directly to avoid timezone issues
    const currentMonthTransactions = transactions.filter(t => {
      const [tYear, tMonth] = t.date.split('-').map(Number);
      return (tMonth - 1) === currentMonth && tYear === currentYear;
    });
    
    // Calculate totals
    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate monthly recurring totals
    const monthlyRecurringExpenses = recurring
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => {
        switch (r.frequency) {
          case 'weekly': return sum + (r.amount * 4);
          case 'biweekly': return sum + (r.amount * 2);
          case 'monthly': return sum + r.amount;
          case 'quarterly': return sum + (r.amount / 3);
          case 'yearly': return sum + (r.amount / 12);
          default: return sum + r.amount;
        }
      }, 0);
    
    const monthlyRecurringIncome = recurring
      .filter(r => r.type === 'income')
      .reduce((sum, r) => {
        switch (r.frequency) {
          case 'weekly': return sum + (r.amount * 4);
          case 'biweekly': return sum + (r.amount * 2);
          case 'monthly': return sum + r.amount;
          case 'quarterly': return sum + (r.amount / 3);
          case 'yearly': return sum + (r.amount / 12);
          default: return sum + r.amount;
        }
      }, 0);
    
    res.json({
      currentMonth: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        difference: monthlyIncome - monthlyExpenses
      },
      recurring: {
        monthlyExpenses: monthlyRecurringExpenses,
        monthlyIncome: monthlyRecurringIncome,
        count: recurring.length
      },
      totals: {
        transactions: transactions.length,
        income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

/**
 * GET /api/users/:userId/stats/monthly - Get monthly breakdown
 * Query params: months, month (0-11), year - month/year specify client's current month
 */
router.get('/:userId/stats/monthly', (req, res) => {
  try {
    const userId = req.params.userId;
    const { months = 6, month, year } = req.query;
    
    if (!db.userExists(userId)) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const transactions = db.getAll('transactions', userId);
    const categories = db.getAll('categories', userId);
    
    // Use client-provided month/year if available, otherwise use server time
    const now = new Date();
    const baseMonth = month !== undefined ? parseInt(month, 10) : now.getMonth();
    const baseYear = year !== undefined ? parseInt(year, 10) : now.getFullYear();
    const monthsToShow = parseInt(months, 10) || 6;
    const monthlyData = [];
    
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(baseYear, baseMonth - i, 1);
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();
      
      // Parse date strings directly to avoid timezone issues
      const monthTransactions = transactions.filter(t => {
        const [tYear, tMonth] = t.date.split('-').map(Number);
        return (tMonth - 1) === targetMonth && tYear === targetYear;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Category breakdown
      const categoryBreakdown = {};
      monthTransactions.forEach(t => {
        const category = categories.find(c => c.id === t.categoryId);
        const categoryName = category ? category.name : 'Unknown';
        if (!categoryBreakdown[categoryName]) {
          categoryBreakdown[categoryName] = { income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          categoryBreakdown[categoryName].income += t.amount;
        } else {
          categoryBreakdown[categoryName].expenses += t.amount;
        }
      });
      
      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year,
        fullDate: `${year}-${String(month + 1).padStart(2, '0')}`,
        income,
        expenses,
        difference: income - expenses,
        transactionCount: monthTransactions.length,
        categoryBreakdown
      });
    }
    
    res.json(monthlyData);
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    res.status(500).json({ error: 'Failed to get monthly stats' });
  }
});

/**
 * GET /api/users/:userId/stats/comparison - Get month-on-month comparison
 * Query params: months, month (0-11), year - month/year specify client's current month
 */
router.get('/:userId/stats/comparison', (req, res) => {
  try {
    const userId = req.params.userId;
    const { months = 12, month, year } = req.query;
    
    if (!db.userExists(userId)) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const transactions = db.getAll('transactions', userId);
    const monthsToCompare = parseInt(months, 10) || 12;
    
    // Use client-provided month/year if available, otherwise use server time
    const now = new Date();
    const baseMonth = month !== undefined ? parseInt(month, 10) : now.getMonth();
    const baseYear = year !== undefined ? parseInt(year, 10) : now.getFullYear();
    const comparison = [];
    
    for (let i = 0; i < monthsToCompare; i++) {
      const date = new Date(baseYear, baseMonth - i, 1);
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();
      
      // Parse date strings directly to avoid timezone issues
      const monthTransactions = transactions.filter(t => {
        const [tYear, tMonth] = t.date.split('-').map(Number);
        return (tMonth - 1) === targetMonth && tYear === targetYear;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      comparison.push({
        label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        month: date.toLocaleString('default', { month: 'short' }),
        year,
        income,
        expenses,
        savings: income - expenses,
        savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0
      });
    }
    
    res.json(comparison.reverse());
  } catch (error) {
    console.error('Error getting comparison:', error);
    res.status(500).json({ error: 'Failed to get comparison' });
  }
});

module.exports = router;
