/**
 * Simple file-based JSON database utility
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Default database structure with default categories template
const DEFAULT_DB = {
  users: [],
  categories: [],
  transactions: [],
  recurring: []
};

// Default categories to create for new users
const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Groceries', type: 'expense', icon: '🛒' },
  { name: 'Rent', type: 'expense', icon: '🏠' },
  { name: 'Utilities', type: 'expense', icon: '💡' },
  { name: 'Transportation', type: 'expense', icon: '🚗' },
  { name: 'Entertainment', type: 'expense', icon: '🎬' },
  { name: 'Dining Out', type: 'expense', icon: '🍽️' },
  { name: 'Healthcare', type: 'expense', icon: '🏥' },
  { name: 'Shopping', type: 'expense', icon: '🛍️' },
  { name: 'Subscriptions', type: 'expense', icon: '📱' },
  { name: 'Insurance', type: 'expense', icon: '🛡️' },
  { name: 'Education', type: 'expense', icon: '📚' },
  { name: 'Personal Care', type: 'expense', icon: '💅' },
  { name: 'Other Expense', type: 'expense', icon: '📋' },
  // Income categories
  { name: 'Salary', type: 'income', icon: '💰' },
  { name: 'Freelance', type: 'income', icon: '💻' },
  { name: 'Investments', type: 'income', icon: '📈' },
  { name: 'Gifts', type: 'income', icon: '🎁' },
  { name: 'Refunds', type: 'income', icon: '💵' },
  { name: 'Other Income', type: 'income', icon: '✨' }
];

/**
 * Ensure data directory and db.json exist
 */
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

/**
 * Read the entire database
 */
function readDb() {
  initDb();
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

/**
 * Write the entire database
 */
function writeDb(data) {
  initDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * Get all items from a collection
 */
function getAll(collection) {
  const db = readDb();
  return db[collection] || [];
}

/**
 * Get item by ID from a collection
 */
function getById(collection, id) {
  const db = readDb();
  return (db[collection] || []).find(item => item.id === id);
}

/**
 * Get items by user ID
 */
function getByUserId(collection, userId) {
  const db = readDb();
  return (db[collection] || []).filter(item => item.userId === userId);
}

/**
 * Insert a new item into a collection
 */
function insert(collection, item) {
  const db = readDb();
  if (!db[collection]) {
    db[collection] = [];
  }
  db[collection].push(item);
  writeDb(db);
  return item;
}

/**
 * Insert multiple items into a collection
 */
function insertMany(collection, items) {
  const db = readDb();
  if (!db[collection]) {
    db[collection] = [];
  }
  db[collection].push(...items);
  writeDb(db);
  return items;
}

/**
 * Update an item in a collection
 */
function update(collection, id, updates) {
  const db = readDb();
  const index = (db[collection] || []).findIndex(item => item.id === id);
  if (index === -1) {
    return null;
  }
  db[collection][index] = { ...db[collection][index], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db[collection][index];
}

/**
 * Delete an item from a collection
 */
function remove(collection, id) {
  const db = readDb();
  const index = (db[collection] || []).findIndex(item => item.id === id);
  if (index === -1) {
    return false;
  }
  db[collection].splice(index, 1);
  writeDb(db);
  return true;
}

/**
 * Delete multiple items by user ID
 */
function removeByUserId(collection, userId) {
  const db = readDb();
  const initialLength = (db[collection] || []).length;
  db[collection] = (db[collection] || []).filter(item => item.userId !== userId);
  writeDb(db);
  return initialLength - db[collection].length;
}

/**
 * Check if a user exists
 */
function userExists(userId) {
  return !!getById('users', userId);
}

/**
 * Get default categories template
 */
function getDefaultCategories() {
  return DEFAULT_CATEGORIES;
}

module.exports = {
  initDb,
  readDb,
  writeDb,
  getAll,
  getById,
  getByUserId,
  insert,
  insertMany,
  update,
  remove,
  removeByUserId,
  userExists,
  getDefaultCategories
};
