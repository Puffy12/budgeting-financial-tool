const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { categoryView } = require('./categoryView');
const { processSpecificRecurring } = require('./recurringProcessor');

function ownedCategory(userId, categoryId) {
  const category = db.getById('categories', categoryId, userId);
  if (!category || category.userId !== userId) return null;
  return category;
}

function listRecurring(userId, query) {
  let recurring = db.getAll('recurring', userId);
  const { type, isActive } = query;

  if (type && ['income', 'expense'].includes(type)) {
    recurring = recurring.filter((item) => item.type === type);
  }
  if (isActive !== undefined) {
    const active = isActive === 'true';
    recurring = recurring.filter((item) => item.isActive === active);
  }

  recurring.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  const categories = db.getAll('categories', userId);
  return recurring.map((item) => {
    const category = categories.find((entry) => entry.id === item.categoryId);
    return { ...item, category: categoryView(category) };
  });
}

function getRecurring(userId, recurringId) {
  const recurring = db.getById('recurring', recurringId, userId);
  if (!recurring || recurring.userId !== userId) return null;
  const category = db.getById('categories', recurring.categoryId, userId);
  return { ...recurring, category: categoryView(category) };
}

function createRecurring(userId, body) {
  const { name, amount, type, categoryId, frequency, startDate, notes } = body;
  const category = ownedCategory(userId, categoryId);
  if (!category) return { error: 'Invalid category', status: 400 };

  const now = new Date().toISOString();
  const start = startDate || now.split('T')[0];
  const recurring = {
    id: uuidv4(),
    userId,
    name,
    categoryId,
    amount,
    type,
    frequency,
    startDate: start,
    nextDueDate: start,
    notes: notes || '',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  db.insert('recurring', recurring, userId);
  return { status: 201, body: { ...recurring, category: categoryView(category) } };
}

function updateRecurring(userId, recurringId, body) {
  const existing = db.getById('recurring', recurringId, userId);
  if (!existing || existing.userId !== userId) {
    return { error: 'Recurring transaction not found', status: 404 };
  }

  const { name, amount, type, categoryId, frequency, nextDueDate, notes, isActive } = body;
  const updates = {};
  if (name) updates.name = name;
  if (amount !== undefined) updates.amount = amount;
  if (type) updates.type = type;
  if (categoryId) {
    if (!ownedCategory(userId, categoryId)) return { error: 'Invalid category', status: 400 };
    updates.categoryId = categoryId;
  }
  if (frequency) updates.frequency = frequency;
  if (nextDueDate) updates.nextDueDate = nextDueDate;
  if (notes !== undefined) updates.notes = notes;
  if (isActive !== undefined) updates.isActive = isActive;

  const recurring = db.update('recurring', recurringId, updates, userId);
  const category = db.getById('categories', recurring.categoryId, userId);
  return { status: 200, body: { ...recurring, category: categoryView(category) } };
}

function deleteRecurring(userId, recurringId) {
  const recurring = db.getById('recurring', recurringId, userId);
  if (!recurring || recurring.userId !== userId) {
    return { error: 'Recurring transaction not found', status: 404 };
  }
  db.remove('recurring', recurringId, userId);
  return { status: 200, body: { message: 'Recurring transaction deleted successfully' } };
}

function processRecurring(userId, recurringId) {
  const result = processSpecificRecurring(recurringId, userId);
  if (!result.success) return { error: result.error, status: 400 };
  return {
    status: 200,
    body: {
      message: 'Recurring transaction processed successfully',
      transaction: result.transaction,
    },
  };
}

module.exports = {
  listRecurring,
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  processRecurring,
};
