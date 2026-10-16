const { v4: uuidv4 } = require('uuid');
const db = require('../db');

function listBudgets(userId) {
  return db.getAll('budgets', userId)
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

function saveBudget(userId, body) {
  const year = body.year;
  const month = body.month;
  const existing = listBudgets(userId).find((item) => item.year === year && item.month === month);
  const now = new Date().toISOString();
  if (existing) {
    return db.update('budgets', existing.id, { amount: body.amount }, userId);
  }
  return db.insert('budgets', {
    id: uuidv4(),
    userId,
    year,
    month,
    amount: body.amount,
    createdAt: now,
    updatedAt: now,
  }, userId);
}

module.exports = { listBudgets, saveBudget };
