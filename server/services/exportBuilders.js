const db = require('../db');

function categoryName(categories, categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  return category ? category.name : 'Unknown';
}

function buildFullExport(userId) {
  const user = db.getUserById(userId);
  const categories = db.getAll('categories', userId);
  const transactions = db.getAll('transactions', userId);
  const recurring = db.getAll('recurring', userId);

  return {
    filename: `budget-export-${user.name}-${new Date().toISOString().split('T')[0]}.json`,
    body: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      user: { name: user.name, createdAt: user.createdAt },
      categories: categories.map((item) => ({ name: item.name, type: item.type, icon: item.icon })),
      transactions: transactions.map((item) => ({
        amount: item.amount,
        type: item.type,
        categoryName: categoryName(categories, item.categoryId),
        date: item.date,
        notes: item.notes,
        isRecurring: item.isRecurring,
      })),
      recurring: recurring.map((item) => ({
        name: item.name,
        amount: item.amount,
        type: item.type,
        categoryName: categoryName(categories, item.categoryId),
        frequency: item.frequency,
        startDate: item.startDate,
        nextDueDate: item.nextDueDate,
        notes: item.notes,
        isActive: item.isActive,
      })),
    },
  };
}

function buildMonthExport(userId, yearParam, monthParam) {
  const year = parseInt(yearParam, 10);
  const month = parseInt(monthParam, 10) - 1;
  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    return { error: 'Invalid year or month', status: 400 };
  }

  const user = db.getUserById(userId);
  const categories = db.getAll('categories', userId);
  const transactions = db.getAll('transactions', userId).filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
  const income = transactions.filter((item) => item.type === 'income');
  const expenses = transactions.filter((item) => item.type === 'expense');
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  return {
    filename: `budget-${user.name}-${year}-${String(month + 1).padStart(2, '0')}.json`,
    body: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      period: {
        year,
        month: month + 1,
        monthName: new Date(year, month).toLocaleString('default', { month: 'long' }),
      },
      user: { name: user.name },
      summary: {
        totalIncome,
        totalExpenses,
        difference: totalIncome - totalExpenses,
        transactionCount: transactions.length,
      },
      income: income.map((item) => ({
        amount: item.amount,
        categoryName: categoryName(categories, item.categoryId),
        date: item.date,
        notes: item.notes,
      })),
      expenses: expenses.map((item) => ({
        amount: item.amount,
        categoryName: categoryName(categories, item.categoryId),
        date: item.date,
        notes: item.notes,
      })),
    },
  };
}

module.exports = { buildFullExport, buildMonthExport };
