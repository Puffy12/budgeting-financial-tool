const fs = require('fs');
const { USERS_FILE, getUserDir } = require('./paths');
const { readJsonFile, writeJsonFile } = require('./jsonStore');

function getAllUsers() {
  const { initDb } = require('./index');
  initDb();
  return readJsonFile(USERS_FILE);
}

function getUserById(userId) {
  return getAllUsers().find((user) => user.id === userId);
}

function getUserByName(name) {
  return getAllUsers().find((user) => user.name.toLowerCase() === name.toLowerCase());
}

function userExists(userId) {
  return !!getUserById(userId);
}

function insertUser(user) {
  const { initUserDir } = require('./collections');
  const users = getAllUsers();
  users.push(user);
  writeJsonFile(USERS_FILE, users);
  initUserDir(user.id);
  return user;
}

function updateUser(userId, updates) {
  const users = getAllUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  writeJsonFile(USERS_FILE, users);
  return users[index];
}

function deleteUser(userId) {
  const users = getAllUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index === -1) return false;

  users.splice(index, 1);
  writeJsonFile(USERS_FILE, users);

  const userDir = getUserDir(userId);
  if (fs.existsSync(userDir)) {
    fs.rmSync(userDir, { recursive: true, force: true });
  }
  return true;
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByName,
  userExists,
  insertUser,
  updateUser,
  deleteUser,
};
