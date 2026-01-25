/**
 * Export/Import Routes
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
 * GET /api/users/:userId/export - Export all user data
 */
router.get('/export', (req, res) => {
  try {
    const userId = req.params.userId;
    const user = db.getById('users', userId);
    const categories = db.getByUserId('categories', userId);
    const transactions = db.getByUserId('transactions', userId);
    const recurring = db.getByUserId('recurring', userId);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      user: {
        name: user.name,
        createdAt: user.createdAt
      },
      categories: categories.map(c => ({
        name: c.name,
        type: c.type,
        icon: c.icon
      })),
      transactions: transactions.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return {
          amount: t.amount,
          type: t.type,
          categoryName: category ? category.name : 'Unknown',
          date: t.date,
          notes: t.notes,
          isRecurring: t.isRecurring
        };
      }),
      recurring: recurring.map(r => {
        const category = categories.find(c => c.id === r.categoryId);
        return {
          name: r.name,
          amount: r.amount,
          type: r.type,
          categoryName: category ? category.name : 'Unknown',
          frequency: r.frequency,
          startDate: r.startDate,
          nextDueDate: r.nextDueDate,
          notes: r.notes,
          isActive: r.isActive
        };
      })
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="budget-export-${user.name}-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

/**
 * GET /api/users/:userId/export/month/:year/:month - Export monthly data
 */
router.get('/export/month/:year/:month', (req, res) => {
  try {
    const userId = req.params.userId;
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10) - 1; // JS months are 0-indexed
    
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }
    
    const user = db.getById('users', userId);
    const categories = db.getByUserId('categories', userId);
    const allTransactions = db.getByUserId('transactions', userId);
    
    // Filter transactions for the specified month
    const transactions = allTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
    
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      period: {
        year,
        month: month + 1,
        monthName: new Date(year, month).toLocaleString('default', { month: 'long' })
      },
      user: {
        name: user.name
      },
      summary: {
        totalIncome,
        totalExpenses,
        difference: totalIncome - totalExpenses,
        transactionCount: transactions.length
      },
      income: income.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return {
          amount: t.amount,
          categoryName: category ? category.name : 'Unknown',
          date: t.date,
          notes: t.notes
        };
      }),
      expenses: expenses.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return {
          amount: t.amount,
          categoryName: category ? category.name : 'Unknown',
          date: t.date,
          notes: t.notes
        };
      })
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="budget-${user.name}-${year}-${String(month + 1).padStart(2, '0')}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting monthly data:', error);
    res.status(500).json({ error: 'Failed to export monthly data' });
  }
});

/**
 * GET /api/users/:userId/export/year/:year - Export yearly data
 */
router.get('/export/year/:year', (req, res) => {
  try {
    const userId = req.params.userId;
    const year = parseInt(req.params.year, 10);
    
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    
    const user = db.getById('users', userId);
    const categories = db.getByUserId('categories', userId);
    const allTransactions = db.getByUserId('transactions', userId);
    
    // Filter transactions for the specified year
    const transactions = allTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year;
    });
    
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Monthly breakdown
    const monthlyBreakdown = [];
    for (let m = 0; m < 12; m++) {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === m;
      });
      
      const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const monthExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      monthlyBreakdown.push({
        month: m + 1,
        monthName: new Date(year, m).toLocaleString('default', { month: 'long' }),
        income: monthIncome,
        expenses: monthExpenses,
        difference: monthIncome - monthExpenses,
        transactionCount: monthTransactions.length
      });
    }
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      period: { year },
      user: { name: user.name },
      summary: {
        totalIncome,
        totalExpenses,
        difference: totalIncome - totalExpenses,
        transactionCount: transactions.length
      },
      monthlyBreakdown,
      transactions: transactions.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return {
          amount: t.amount,
          type: t.type,
          categoryName: category ? category.name : 'Unknown',
          date: t.date,
          notes: t.notes
        };
      })
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="budget-${user.name}-${year}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting yearly data:', error);
    res.status(500).json({ error: 'Failed to export yearly data' });
  }
});

/**
 * POST /api/users/:userId/import - Import user data
 */
router.post('/import', (req, res) => {
  try {
    const userId = req.params.userId;
    const { data, mode = 'merge' } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Import data is required' });
    }
    
    if (!['merge', 'replace'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be "merge" or "replace"' });
    }
    
    const now = new Date().toISOString();
    const categories = db.getByUserId('categories', userId);
    
    let importedCategories = 0;
    let importedTransactions = 0;
    let importedRecurring = 0;
    
    // If replace mode, clear existing data
    if (mode === 'replace') {
      db.removeByUserId('transactions', userId);
      db.removeByUserId('recurring', userId);
    }
    
    // Import categories (always merge to avoid duplicates)
    if (data.categories && Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        const exists = categories.find(c => c.name.toLowerCase() === cat.name.toLowerCase() && c.type === cat.type);
        if (!exists) {
          db.insert('categories', {
            id: uuidv4(),
            userId,
            name: cat.name,
            type: cat.type,
            icon: cat.icon || (cat.type === 'expense' ? '📋' : '💰'),
            createdAt: now,
            updatedAt: now
          });
          importedCategories++;
        }
      }
    }
    
    // Refresh categories list after imports
    const updatedCategories = db.getByUserId('categories', userId);
    
    // Import transactions
    if (data.transactions && Array.isArray(data.transactions)) {
      for (const trans of data.transactions) {
        const category = updatedCategories.find(c => c.name.toLowerCase() === trans.categoryName.toLowerCase());
        
        if (category) {
          db.insert('transactions', {
            id: uuidv4(),
            userId,
            categoryId: category.id,
            amount: trans.amount,
            type: trans.type,
            date: trans.date,
            notes: trans.notes || '',
            isRecurring: trans.isRecurring || false,
            recurringId: null,
            createdAt: now,
            updatedAt: now
          });
          importedTransactions++;
        }
      }
    }
    
    // Import recurring
    if (data.recurring && Array.isArray(data.recurring)) {
      for (const rec of data.recurring) {
        const category = updatedCategories.find(c => c.name.toLowerCase() === rec.categoryName.toLowerCase());
        
        if (category) {
          db.insert('recurring', {
            id: uuidv4(),
            userId,
            name: rec.name,
            categoryId: category.id,
            amount: rec.amount,
            type: rec.type,
            frequency: rec.frequency,
            startDate: rec.startDate,
            nextDueDate: rec.nextDueDate || rec.startDate,
            notes: rec.notes || '',
            isActive: rec.isActive !== undefined ? rec.isActive : true,
            createdAt: now,
            updatedAt: now
          });
          importedRecurring++;
        }
      }
    }
    
    res.json({
      message: 'Import completed successfully',
      imported: {
        categories: importedCategories,
        transactions: importedTransactions,
        recurring: importedRecurring
      }
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;
