function transactionInMonth(dateString, monthIndex, year) {
  const [tYear, tMonth] = dateString.split('-').map(Number);
  return (tMonth - 1) === monthIndex && tYear === year;
}

function clientMonthYear(query) {
  const now = new Date();
  const currentMonth = query.month !== undefined ? parseInt(query.month, 10) : now.getMonth();
  const currentYear = query.year !== undefined ? parseInt(query.year, 10) : now.getFullYear();
  return { currentMonth, currentYear };
}

function monthlyRecurringAmount(amount, frequency) {
  switch (frequency) {
    case 'weekly': return amount * 4;
    case 'biweekly': return amount * 2;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    default: return amount;
  }
}

module.exports = { transactionInMonth, clientMonthYear, monthlyRecurringAmount };
