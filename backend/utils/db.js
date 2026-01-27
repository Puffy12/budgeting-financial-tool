/**
 * File-based JSON database utility
 * 
 * Structure:
 * data/
 *   users.json              - List of all users
 *   {userId}/
 *     categories.json       - User's categories
 *     transactions.json     - User's transactions  
 *     recurring.json        - User's recurring transactions
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Default categories to create for new users
// Icon IDs correspond to Lucide icons defined in frontend/src/utils/categoryIcons.ts
const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Groceries', type: 'expense', icon: 'shopping-cart' },
  { name: 'Rent', type: 'expense', icon: 'home' },
  { name: 'Utilities', type: 'expense', icon: 'lightbulb' },
  { name: 'Transportation', type: 'expense', icon: 'car' },
  { name: 'Entertainment', type: 'expense', icon: 'film' },
  { name: 'Dining Out', type: 'expense', icon: 'utensils' },
  { name: 'Healthcare', type: 'expense', icon: 'stethoscope' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag' },
  { name: 'Subscriptions', type: 'expense', icon: 'smartphone' },
  { name: 'Insurance', type: 'expense', icon: 'shield' },
  { name: 'Education', type: 'expense', icon: 'book' },
  { name: 'Personal Care', type: 'expense', icon: 'sparkles' },
  { name: 'Other Expense', type: 'expense', icon: 'folder' },
  // Income categories
  { name: 'Salary', type: 'income', icon: 'wallet' },
  { name: 'Freelance', type: 'income', icon: 'laptop' },
  { name: 'Investments', type: 'income', icon: 'trending-up' },
  { name: 'Gifts', type: 'income', icon: 'gift' },
  { name: 'Refunds', type: 'income', icon: 'banknote' },
  { name: 'Other Income', type: 'income', icon: 'star' }
];

/**
 * Ensure data directory exists
 */
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Get path to user's data directory
 */
function getUserDir(userId) {
  return path.join(DATA_DIR, userId);
}

/**
 * Get path to a user's collection file
 */
function getUserCollectionPath(userId, collection) {
  return path.join(getUserDir(userId), `${collection}.json`);
}

/**
 * Ensure user directory and files exist
 */
function initUserDir(userId) {
  const userDir = getUserDir(userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  const collections = ['categories', 'transactions', 'recurring'];
  for (const collection of collections) {
    const filePath = getUserCollectionPath(userId, collection);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }
}

/**
 * Read JSON file safely
 */
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

/**
 * Write JSON file safely
 */
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ============ Users Collection ============

/**
 * Get all users
 */
function getAllUsers() {
  initDb();
  return readJsonFile(USERS_FILE);
}

/**
 * Get user by ID
 */
function getUserById(userId) {
  const users = getAllUsers();
  return users.find(u => u.id === userId);
}

/**
 * Insert a new user
 */
function insertUser(user) {
  const users = getAllUsers();
  users.push(user);
  writeJsonFile(USERS_FILE, users);
  
  // Create user's data directory
  initUserDir(user.id);
  
  return user;
}

/**
 * Update a user
 */
function updateUser(userId, updates) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  writeJsonFile(USERS_FILE, users);
  return users[index];
}

/**
 * Delete a user and their data
 */
function deleteUser(userId) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;
  
  users.splice(index, 1);
  writeJsonFile(USERS_FILE, users);
  
  // Delete user's data directory
  const userDir = getUserDir(userId);
  if (fs.existsSync(userDir)) {
    fs.rmSync(userDir, { recursive: true, force: true });
  }
  
  return true;
}

/**
 * Check if user exists
 */
function userExists(userId) {
  return !!getUserById(userId);
}

// ============ User Collections (categories, transactions, recurring) ============

/**
 * Get all items from a user's collection
 */
function getAll(collection, userId) {
  if (!userId) {
    console.error('getAll requires userId');
    return [];
  }
  initUserDir(userId);
  const filePath = getUserCollectionPath(userId, collection);
  return readJsonFile(filePath);
}

/**
 * Get item by ID from a user's collection
 */
function getById(collection, id, userId) {
  const items = getAll(collection, userId);
  return items.find(item => item.id === id);
}

/**
 * Get items by user ID (for compatibility - just returns all items in user's collection)
 */
function getByUserId(collection, userId) {
  return getAll(collection, userId);
}

/**
 * Insert a new item into a user's collection
 */
function insert(collection, item, userId) {
  if (!userId) {
    userId = item.userId;
  }
  if (!userId) {
    console.error('insert requires userId');
    return null;
  }
  
  initUserDir(userId);
  const filePath = getUserCollectionPath(userId, collection);
  const items = readJsonFile(filePath);
  items.push(item);
  writeJsonFile(filePath, items);
  return item;
}

/**
 * Insert multiple items into a user's collection
 */
function insertMany(collection, newItems, userId) {
  if (!userId && newItems.length > 0) {
    userId = newItems[0].userId;
  }
  if (!userId) {
    console.error('insertMany requires userId');
    return [];
  }
  
  initUserDir(userId);
  const filePath = getUserCollectionPath(userId, collection);
  const items = readJsonFile(filePath);
  items.push(...newItems);
  writeJsonFile(filePath, items);
  return newItems;
}

/**
 * Update an item in a user's collection
 */
function update(collection, id, updates, userId) {
  if (!userId) {
    console.error('update requires userId');
    return null;
  }
  
  const filePath = getUserCollectionPath(userId, collection);
  const items = readJsonFile(filePath);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeJsonFile(filePath, items);
  return items[index];
}

/**
 * Delete an item from a user's collection
 */
function remove(collection, id, userId) {
  if (!userId) {
    console.error('remove requires userId');
    return false;
  }
  
  const filePath = getUserCollectionPath(userId, collection);
  const items = readJsonFile(filePath);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) return false;
  
  items.splice(index, 1);
  writeJsonFile(filePath, items);
  return true;
}

/**
 * Delete all items in a user's collection (used when deleting user)
 */
function removeByUserId(collection, userId) {
  const filePath = getUserCollectionPath(userId, collection);
  if (fs.existsSync(filePath)) {
    const items = readJsonFile(filePath);
    const count = items.length;
    writeJsonFile(filePath, []);
    return count;
  }
  return 0;
}

/**
 * Get default categories template
 */
function getDefaultCategories() {
  return DEFAULT_CATEGORIES;
}

// ============ Migration Helper ============

/**
 * Migrate from old single db.json format to new folder structure
 */
function migrateFromOldFormat() {
  const oldDbPath = path.join(DATA_DIR, 'db.json');
  
  if (!fs.existsSync(oldDbPath)) {
    return false; // No migration needed
  }
  
  console.log('Migrating from old database format...');
  
  try {
    const oldData = JSON.parse(fs.readFileSync(oldDbPath, 'utf8'));
    
    // Migrate users
    if (oldData.users && oldData.users.length > 0) {
      writeJsonFile(USERS_FILE, oldData.users);
      
      // For each user, create their folder and migrate their data
      for (const user of oldData.users) {
        initUserDir(user.id);
        
        // Migrate categories
        const userCategories = (oldData.categories || []).filter(c => c.userId === user.id);
        writeJsonFile(getUserCollectionPath(user.id, 'categories'), userCategories);
        
        // Migrate transactions
        const userTransactions = (oldData.transactions || []).filter(t => t.userId === user.id);
        writeJsonFile(getUserCollectionPath(user.id, 'transactions'), userTransactions);
        
        // Migrate recurring
        const userRecurring = (oldData.recurring || []).filter(r => r.userId === user.id);
        writeJsonFile(getUserCollectionPath(user.id, 'recurring'), userRecurring);
        
        console.log(`  Migrated user: ${user.name} (${user.id})`);
      }
    }
    
    // Rename old db.json to db.json.backup
    fs.renameSync(oldDbPath, path.join(DATA_DIR, 'db.json.backup'));
    console.log('Migration complete! Old database backed up to db.json.backup');
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Run migration on module load
initDb();
migrateFromOldFormat();

module.exports = {
  initDb,
  initUserDir,
  // Users
  getAllUsers,
  getUserById,
  insertUser,
  updateUser,
  deleteUser,
  userExists,
  // Collections
  getAll,
  getById,
  getByUserId,
  insert,
  insertMany,
  update,
  remove,
  removeByUserId,
  // Helpers
  getDefaultCategories
};
