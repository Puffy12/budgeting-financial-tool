const path = require('path');

// User JSON lives at <repo>/data, beside server/, not inside it.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function getUserDir(userId) {
  return path.join(DATA_DIR, userId);
}

function getUserCollectionPath(userId, collection) {
  return path.join(getUserDir(userId), `${collection}.json`);
}

module.exports = {
  DATA_DIR,
  USERS_FILE,
  getUserDir,
  getUserCollectionPath,
};
