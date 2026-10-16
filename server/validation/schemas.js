const common = require('./common');
const users = require('./users');
const categories = require('./categories');
const transactions = require('./transactions');
const recurring = require('./recurring');
const importData = require('./importData');
const auth = require('./auth');

module.exports = {
  ...common,
  ...users,
  ...categories,
  ...transactions,
  ...recurring,
  ...importData,
  ...auth,
};
