const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { categoryView } = require('./categoryView');

function sortTransactions(transactions) {
  transactions.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return transactions;
}

function applyFilters(transactions, query) {
  const { month, year, type, categoryId, startDate, endDate } = query;
  let rows = transactions;

  if (month !== undefined && year !== undefined) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    rows = rows.filter((item) => {
      const [tYear, tMonth] = item.date.split('-').map(Number);
      return (tMonth - 1) === m && tYear === y;
    });
  } else if (year !== undefined) {
    const y = parseInt(year, 10);
    rows = rows.filter((item) => parseInt(item.date.split('-')[0], 10) === y);
  }

  if (startDate) rows = rows.filter((item) => item.date >= startDate);
  if (endDate) rows = rows.filter((item) => item.date <= endDate);
  if (type && ['income', 'expense'].includes(type)) rows = rows.filter((item) => item.type === type);
  if (categoryId) rows = rows.filter((item) => item.categoryId === categoryId);
  return rows;
}

function withCategory(transaction, userId, categories) {
  const list = categories || db.getAll('categories', userId);
  const category = list.find((item) => item.id === transaction.categoryId);
  return { ...transaction, category: categoryView(category) };
}

function listTransactions(userId, query) {
  let transactions = applyFilters(db.getAll('transactions', userId), query);
  sortTransactions(transactions);

  const total = transactions.length;
  const { limit, offset } = query;
  if (limit !== undefined) {
    const l = parseInt(limit, 10);
    const o = parseInt(offset, 10) || 0;
    transactions = transactions.slice(o, o + l);
  }

  const categories = db.getAll('categories', userId);
  return {
    transactions: transactions.map((item) => withCategory(item, userId, categories)),
    total,
    limit: limit ? parseInt(limit, 10) : total,
    offset: parseInt(offset, 10) || 0,
  };
}

function getTransaction(userId, transactionId) {
  const transaction = db.getById('transactions', transactionId, userId);
  if (!transaction || transaction.userId !== userId) return null;
  const category = db.getById('categories', transaction.categoryId, userId);
  return { ...transaction, category: categoryView(category) };
}

function ownedCategory(userId, categoryId) {
  const category = db.getById('categories', categoryId, userId);
  if (!category || category.userId !== userId) return null;
  return category;
}

function createTransaction(userId, body) {
  const { amount, type, categoryId, date, notes } = body;
  const category = ownedCategory(userId, categoryId);
  if (!category) return { error: 'Invalid category', status: 400 };

  const now = new Date().toISOString();
  const transaction = {
    id: uuidv4(),
    userId,
    categoryId,
    amount,
    type,
    date: date || now.split('T')[0],
    notes: notes || '',
    isRecurring: false,
    recurringId: null,
    createdAt: now,
    updatedAt: now,
  };
  db.insert('transactions', transaction, userId);
  return { status: 201, body: { ...transaction, category: categoryView(category) } };
}

function updateTransaction(userId, transactionId, body) {
  const existing = db.getById('transactions', transactionId, userId);
  if (!existing || existing.userId !== userId) return { error: 'Transaction not found', status: 404 };

  const { amount, type, categoryId, date, notes } = body;
  const updates = {};
  if (amount !== undefined) updates.amount = amount;
  if (type) updates.type = type;
  if (categoryId) {
    if (!ownedCategory(userId, categoryId)) return { error: 'Invalid category', status: 400 };
    updates.categoryId = categoryId;
  }
  if (date) updates.date = date;
  if (notes !== undefined) updates.notes = notes;

  const transaction = db.update('transactions', transactionId, updates, userId);
  const category = db.getById('categories', transaction.categoryId, userId);
  return { status: 200, body: { ...transaction, category: categoryView(category) } };
}

function deleteTransaction(userId, transactionId) {
  const transaction = db.getById('transactions', transactionId, userId);
  if (!transaction || transaction.userId !== userId) return { error: 'Transaction not found', status: 404 };
  db.remove('transactions', transactionId, userId);
  return { status: 200, body: { message: 'Transaction deleted successfully' } };
}

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
