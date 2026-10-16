const fs = require('fs');
const { getUserDir, getUserCollectionPath } = require('./paths');
const { readJsonFile, writeJsonFile } = require('./jsonStore');

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

function getAll(collection, userId) {
  if (!userId) {
    console.error('getAll requires userId');
    return [];
  }
  initUserDir(userId);
  return readJsonFile(getUserCollectionPath(userId, collection));
}

function getById(collection, id, userId) {
  return getAll(collection, userId).find((item) => item.id === id);
}

function getByUserId(collection, userId) {
  return getAll(collection, userId);
}

function insert(collection, item, userId) {
  if (!userId) userId = item.userId;
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

function insertMany(collection, newItems, userId) {
  if (!userId && newItems.length > 0) userId = newItems[0].userId;
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

function update(collection, id, updates, userId) {
  if (!userId) {
    console.error('update requires userId');
    return null;
  }

  const filePath = getUserCollectionPath(userId, collection);
  const items = readJsonFile(filePath);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeJsonFile(filePath, items);
  return items[index];
}

function remove(collection, id, userId) {
  if (!userId) {
    console.error('remove requires userId');
    return false;
  }

  const filePath = getUserCollectionPath(userId, collection);
  const items = readJsonFile(filePath);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  items.splice(index, 1);
  writeJsonFile(filePath, items);
  return true;
}

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

module.exports = {
  initUserDir,
  getAll,
  getById,
  getByUserId,
  insert,
  insertMany,
  update,
  remove,
  removeByUserId,
};
