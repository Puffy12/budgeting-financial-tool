const { v4: uuidv4 } = require('uuid');
const db = require('../db');

function importUserData(userId, payload) {
  const { data, mode = 'merge' } = payload || {};
  if (!data) return { error: 'Import data is required', status: 400 };
  if (!['merge', 'replace'].includes(mode)) return { error: 'Mode must be "merge" or "replace"', status: 400 };

  const now = new Date().toISOString();
  const categories = db.getAll('categories', userId);
  let importedCategories = 0;
  let importedTransactions = 0;
  let importedRecurring = 0;

  if (mode === 'replace') {
    db.removeByUserId('transactions', userId);
    db.removeByUserId('recurring', userId);
  }

  if (data.categories && Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      const exists = categories.find((item) => item.name.toLowerCase() === cat.name.toLowerCase() && item.type === cat.type);
      if (!exists) {
        db.insert('categories', {
          id: uuidv4(),
          userId,
          name: cat.name,
          type: cat.type,
          icon: cat.icon || (cat.type === 'expense' ? '📋' : '💰'),
          createdAt: now,
          updatedAt: now,
        }, userId);
        importedCategories++;
      }
    }
  }

  const updatedCategories = db.getAll('categories', userId);
  if (data.transactions && Array.isArray(data.transactions)) {
    for (const trans of data.transactions) {
      const category = updatedCategories.find((item) => item.name.toLowerCase() === trans.categoryName.toLowerCase());
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
          updatedAt: now,
        }, userId);
        importedTransactions++;
      }
    }
  }

  if (data.recurring && Array.isArray(data.recurring)) {
    for (const rec of data.recurring) {
      const category = updatedCategories.find((item) => item.name.toLowerCase() === rec.categoryName.toLowerCase());
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
          updatedAt: now,
        }, userId);
        importedRecurring++;
      }
    }
  }

  return {
    status: 200,
    body: {
      message: 'Import completed successfully',
      imported: {
        categories: importedCategories,
        transactions: importedTransactions,
        recurring: importedRecurring,
      },
    },
  };
}

module.exports = { importUserData };
