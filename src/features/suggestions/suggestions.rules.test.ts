import assert from 'node:assert/strict'
import test from 'node:test'
import { averageSpend, budgetStanding, shiftMonth, sumCategoryExpenses, topExpenses } from './suggestions.rules.ts'

test('budget standing uses the experimental 80 percent line', () => {
  assert.equal(budgetStanding(79, 100), 'inside')
  assert.equal(budgetStanding(80, 100), 'close')
  assert.equal(budgetStanding(100, 100), 'close')
  assert.equal(budgetStanding(100.01, 100), 'over')
  assert.equal(budgetStanding(40, 0), 'unset')
})

test('average spend ignores an empty window', () => {
  assert.equal(averageSpend([]), 0)
  assert.equal(averageSpend([100, 300]), 200)
})

test('month shift keeps the calendar month', () => {
  assert.deepEqual(shiftMonth(2026, 1, -1), { year: 2025, month: 12 })
  assert.deepEqual(shiftMonth(2026, 3, -5), { year: 2025, month: 10 })
})

test('category totals and top expenses keep the largest first', () => {
  const categories = sumCategoryExpenses([
    { categoryBreakdown: { Food: { expenses: 20 }, Rent: { expenses: 5 } } },
    { categoryBreakdown: { Food: { expenses: 10 } } },
  ])
  assert.deepEqual(categories, [
    { name: 'Food', amount: 30 },
    { name: 'Rent', amount: 5 },
  ])
  const expenses = topExpenses([
    { type: 'expense', amount: 12, date: '2026-01-02' },
    { type: 'income', amount: 99, date: '2026-01-03' },
    { type: 'expense', amount: 40, date: '2026-01-01' },
  ], 1)
  assert.equal(expenses[0].amount, 40)
})
