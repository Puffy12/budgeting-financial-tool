const fs = require('fs');
const path = require('path');
const { DATA_DIR, USERS_FILE, getUserCollectionPath } = require('./paths');
const { writeJsonFile } = require('./jsonStore');
const { initUserDir } = require('./collections');

function migrateFromOldFormat() {
  const oldDbPath = path.join(DATA_DIR, 'db.json');
  if (!fs.existsSync(oldDbPath)) return false;

  console.log('Migrating from old database format...');

  try {
    const oldData = JSON.parse(fs.readFileSync(oldDbPath, 'utf8'));

    if (oldData.users && oldData.users.length > 0) {
      writeJsonFile(USERS_FILE, oldData.users);

      for (const user of oldData.users) {
        initUserDir(user.id);
        const userCategories = (oldData.categories || []).filter((item) => item.userId === user.id);
        const userTransactions = (oldData.transactions || []).filter((item) => item.userId === user.id);
        const userRecurring = (oldData.recurring || []).filter((item) => item.userId === user.id);
        writeJsonFile(getUserCollectionPath(user.id, 'categories'), userCategories);
        writeJsonFile(getUserCollectionPath(user.id, 'transactions'), userTransactions);
        writeJsonFile(getUserCollectionPath(user.id, 'recurring'), userRecurring);
        console.log(`  Migrated user: ${user.name} (${user.id})`);
      }
    }

    fs.renameSync(oldDbPath, path.join(DATA_DIR, 'db.json.backup'));
    console.log('Migration complete! Old database backed up to db.json.backup');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

module.exports = { migrateFromOldFormat };
