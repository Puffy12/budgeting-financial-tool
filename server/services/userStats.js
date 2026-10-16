const db = require('../db');
const { transactionInMonth, clientMonthYear, monthlyRecurringAmount } = require('./dates');

function buildSummary(userId, query) {
  const transactions = db.getAll('transactions', userId);
  const recurring = db.getAll('recurring', userId).filter((item) => item.isActive);
  const { currentMonth, currentYear } = clientMonthYear(query);

  const currentMonthTransactions = transactions.filter((item) =>
    transactionInMonth(item.date, currentMonth, currentYear)
  );

  const monthlyIncome = currentMonthTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
  const monthlyExpenses = currentMonthTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyRecurringExpenses = recurring
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + monthlyRecurringAmount(item.amount, item.frequency), 0);
  const monthlyRecurringIncome = recurring
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + monthlyRecurringAmount(item.amount, item.frequency), 0);

  return {
    currentMonth: {
      income: monthlyIncome,
      expenses: monthlyExpenses,
      difference: monthlyIncome - monthlyExpenses,
    },
    recurring: {
      monthlyExpenses: monthlyRecurringExpenses,
      monthlyIncome: monthlyRecurringIncome,
      count: recurring.length,
    },
    totals: {
      transactions: transactions.length,
      income: transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
      expenses: transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
    },
  };
}

function monthSlice(transactions, categories, baseYear, baseMonth, index) {
  const date = new Date(baseYear, baseMonth - index, 1);
  const targetMonth = date.getMonth();
  const targetYear = date.getFullYear();
  const monthTransactions = transactions.filter((item) =>
    transactionInMonth(item.date, targetMonth, targetYear)
  );
  const income = monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  const categoryBreakdown = {};
  monthTransactions.forEach((item) => {
    const category = categories.find((entry) => entry.id === item.categoryId);
    const categoryName = category ? category.name : 'Unknown';
    if (!categoryBreakdown[categoryName]) {
      categoryBreakdown[categoryName] = { income: 0, expenses: 0 };
    }
    if (item.type === 'income') categoryBreakdown[categoryName].income += item.amount;
    else categoryBreakdown[categoryName].expenses += item.amount;
  });

  return {
    month: date.toLocaleString('default', { month: 'short' }),
    year: targetYear,
    fullDate: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`,
    income,
    expenses,
    difference: income - expenses,
    transactionCount: monthTransactions.length,
    categoryBreakdown,
    label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
    savings: income - expenses,
    savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0,
  };
}

function buildMonthly(userId, query) {
  const { months = 6 } = query;
  const transactions = db.getAll('transactions', userId);
  const categories = db.getAll('categories', userId);
  const { currentMonth, currentYear } = clientMonthYear(query);
  const monthsToShow = parseInt(months, 10) || 6;
  const monthlyData = [];

  for (let i = 0; i < monthsToShow; i++) {
    const slice = monthSlice(transactions, categories, currentYear, currentMonth, i);
    monthlyData.push({
      month: slice.month,
      year: slice.year,
      fullDate: slice.fullDate,
      income: slice.income,
      expenses: slice.expenses,
      difference: slice.difference,
      transactionCount: slice.transactionCount,
      categoryBreakdown: slice.categoryBreakdown,
    });
  }
  return monthlyData;
}

function buildComparison(userId, query) {
  const { months = 12 } = query;
  const transactions = db.getAll('transactions', userId);
  const { currentMonth, currentYear } = clientMonthYear(query);
  const monthsToCompare = parseInt(months, 10) || 12;
  const comparison = [];

  for (let i = 0; i < monthsToCompare; i++) {
    const slice = monthSlice(transactions, [], currentYear, currentMonth, i);
    comparison.push({
      label: slice.label,
      month: slice.month,
      year: slice.year,
      income: slice.income,
      expenses: slice.expenses,
      savings: slice.savings,
      savingsRate: slice.savingsRate,
    });
  }
  return comparison.reverse();
}

module.exports = { buildSummary, buildMonthly, buildComparison };
