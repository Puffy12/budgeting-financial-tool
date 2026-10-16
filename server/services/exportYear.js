const db = require('../db');

function categoryName(categories, categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  return category ? category.name : 'Unknown';
}

function buildYearExport(userId, yearParam) {
  const year = parseInt(yearParam, 10);
  if (isNaN(year)) return { error: 'Invalid year', status: 400 };

  const user = db.getUserById(userId);
  const categories = db.getAll('categories', userId);
  const transactions = db.getAll('transactions', userId).filter((item) => {
    const date = new Date(item.date);
    return date.getFullYear() === year;
  });
  const income = transactions.filter((item) => item.type === 'income');
  const expenses = transactions.filter((item) => item.type === 'expense');
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const monthlyBreakdown = [];
  for (let m = 0; m < 12; m++) {
    const monthTransactions = transactions.filter((item) => new Date(item.date).getMonth() === m);
    const monthIncome = monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const monthExpenses = monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    monthlyBreakdown.push({
      month: m + 1,
      monthName: new Date(year, m).toLocaleString('default', { month: 'long' }),
      income: monthIncome,
      expenses: monthExpenses,
      difference: monthIncome - monthExpenses,
      transactionCount: monthTransactions.length,
    });
  }

  return {
    filename: `budget-${user.name}-${year}.json`,
    body: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      period: { year },
      user: { name: user.name },
      summary: {
        totalIncome,
        totalExpenses,
        difference: totalIncome - totalExpenses,
        transactionCount: transactions.length,
      },
      monthlyBreakdown,
      transactions: transactions.map((item) => ({
        amount: item.amount,
        type: item.type,
        categoryName: categoryName(categories, item.categoryId),
        date: item.date,
        notes: item.notes,
      })),
    },
  };
}

module.exports = { buildYearExport };
