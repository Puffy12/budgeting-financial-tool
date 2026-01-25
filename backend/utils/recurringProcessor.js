/**
 * Recurring Transaction Processor
 * 
 * Automatically generates transactions from recurring entries
 */

const { v4: uuidv4 } = require('uuid');
const db = require('./db');

/**
 * Calculate the next due date based on frequency
 */
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Process all due recurring transactions for all users
 */
function processRecurringTransactions() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  console.log(`[${now.toISOString()}] Processing recurring transactions...`);
  
  // Get all users
  const users = db.getAllUsers();
  let processedCount = 0;
  
  for (const user of users) {
    const allRecurring = db.getAll('recurring', user.id);
    
    for (const recurring of allRecurring) {
      if (!recurring.isActive) continue;
      
      // Check if the recurring transaction is due
      if (recurring.nextDueDate <= today) {
        // Create the transaction
        const transaction = {
          id: uuidv4(),
          userId: recurring.userId,
          categoryId: recurring.categoryId,
          amount: recurring.amount,
          type: recurring.type,
          date: recurring.nextDueDate,
          notes: recurring.notes ? `${recurring.notes} (Recurring)` : 'Recurring transaction',
          isRecurring: true,
          recurringId: recurring.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        db.insert('transactions', transaction, user.id);
        
        // Update the next due date
        const nextDueDate = calculateNextDueDate(recurring.nextDueDate, recurring.frequency);
        db.update('recurring', recurring.id, { nextDueDate }, user.id);
        
        processedCount++;
        console.log(`  Created transaction for recurring "${recurring.name}" (${recurring.id}) for user ${user.name}`);
      }
    }
  }
  
  console.log(`[${now.toISOString()}] Processed ${processedCount} recurring transactions`);
  return processedCount;
}

/**
 * Manually process a specific recurring transaction
 */
function processSpecificRecurring(recurringId, userId) {
  const recurring = db.getById('recurring', recurringId, userId);
  
  if (!recurring) {
    return { success: false, error: 'Recurring transaction not found' };
  }
  
  if (!recurring.isActive) {
    return { success: false, error: 'Recurring transaction is not active' };
  }
  
  // Create the transaction
  const transaction = {
    id: uuidv4(),
    userId: recurring.userId,
    categoryId: recurring.categoryId,
    amount: recurring.amount,
    type: recurring.type,
    date: new Date().toISOString().split('T')[0],
    notes: recurring.notes ? `${recurring.notes} (Manual)` : 'Manual recurring transaction',
    isRecurring: true,
    recurringId: recurring.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.insert('transactions', transaction, userId);
  
  // Update the next due date
  const nextDueDate = calculateNextDueDate(new Date().toISOString().split('T')[0], recurring.frequency);
  db.update('recurring', recurring.id, { nextDueDate }, userId);
  
  return { success: true, transaction };
}

module.exports = {
  processRecurringTransactions,
  processSpecificRecurring,
  calculateNextDueDate
};
