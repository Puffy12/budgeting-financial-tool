const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { generatePinToken, validatePinToken } = require('../auth/pinToken');

function sanitizeUser(user) {
  if (!user) return null;
  const { pinHash, ...safeUser } = user;
  return safeUser;
}

async function pinLogin(name, pin) {
  const user = db.getUserByName(name);
  if (!user) return { error: 'User not found', status: 404 };
  if (!user.pinHash) {
    return { status: 200, body: { needsPin: true, userId: user.id, name: user.name } };
  }
  const isMatch = await bcrypt.compare(pin, user.pinHash);
  if (!isMatch) return { error: 'Invalid PIN', status: 401 };
  return { status: 200, body: { token: generatePinToken(user.id), user: sanitizeUser(user) } };
}

async function setPin(userId, pin) {
  const user = db.getUserById(userId);
  if (!user) return { error: 'User not found', status: 404 };
  if (user.pinHash) return { error: 'User already has a PIN set', status: 400 };
  const pinHash = await bcrypt.hash(pin, 12);
  const updatedUser = db.updateUser(userId, { pinHash });
  return { status: 200, body: { token: generatePinToken(userId), user: sanitizeUser(updatedUser) } };
}

function validateToken(token) {
  const userId = validatePinToken(token);
  if (!userId) return { error: 'Invalid token', status: 401 };
  const user = db.getUserById(userId);
  if (!user) return { error: 'User not found', status: 401 };
  return { status: 200, body: { valid: true, user: sanitizeUser(user) } };
}

async function registerUser(name, pin) {
  if (db.getUserByName(name)) return { error: 'A user with that name already exists', status: 409 };

  const userId = uuidv4();
  const now = new Date().toISOString();
  const user = {
    id: userId,
    name,
    pinHash: await bcrypt.hash(pin, 12),
    createdAt: now,
    updatedAt: now,
  };
  db.insertUser(user);

  const defaultCategories = db.getDefaultCategories().map((cat) => ({
    id: uuidv4(),
    userId,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
    createdAt: now,
    updatedAt: now,
  }));
  db.insertMany('categories', defaultCategories, userId);

  return { status: 201, body: { token: generatePinToken(userId), user: sanitizeUser(user) } };
}

async function changePin(userId, currentPin, newPin) {
  const user = db.getUserById(userId);
  if (!user) return { error: 'User not found', status: 404 };
  if (!user.pinHash) return { error: 'No PIN set for this user', status: 400 };
  const isMatch = await bcrypt.compare(currentPin, user.pinHash);
  if (!isMatch) return { error: 'Current PIN is incorrect', status: 401 };
  const updatedUser = db.updateUser(userId, { pinHash: await bcrypt.hash(newPin, 12) });
  return { status: 200, body: { token: generatePinToken(userId), user: sanitizeUser(updatedUser) } };
}

module.exports = { pinLogin, setPin, validateToken, registerUser, changePin, sanitizeUser };
