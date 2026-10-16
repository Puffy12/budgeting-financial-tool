const fs = require('fs');
const { DATA_DIR, USERS_FILE } = require('./paths');
const users = require('./users');
const collections = require('./collections');
const { getDefaultCategories } = require('./defaultCategories');
const { migrateFromOldFormat } = require('./migrate');

function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

initDb();
migrateFromOldFormat();

module.exports = {
  initDb,
  initUserDir: collections.initUserDir,
  getAllUsers: users.getAllUsers,
  getUserById: users.getUserById,
  getUserByName: users.getUserByName,
  insertUser: users.insertUser,
  updateUser: users.updateUser,
  deleteUser: users.deleteUser,
  userExists: users.userExists,
  getAll: collections.getAll,
  getById: collections.getById,
  getByUserId: collections.getByUserId,
  insert: collections.insert,
  insertMany: collections.insertMany,
  update: collections.update,
  remove: collections.remove,
  removeByUserId: collections.removeByUserId,
  getDefaultCategories,
};
