# Budget Tracker

A minimalistic, modern financial budgeting application built with React, TypeScript, and Express.

## Features

- **Multi-User Support**: Create and manage separate budgets for different users
- **Transaction Management**: Full CRUD for income and expenses with categories
- **Recurring Transactions**: Set up weekly, bi-weekly, monthly, quarterly, or yearly recurring charges
- **Dashboard**: Visual overview with charts showing income vs expenses
- **Breakdown Analysis**: Detailed month-by-month and year-by-year financial analysis
- **Category Management**: Customize income and expense categories with icons
- **Quick Add**: Quickly add transactions from anywhere in the app
- **Export/Import**: Backup and restore your financial data
- **Mobile Responsive**: Works great on desktop and mobile devices
- **PIN Authentication**: Secure per-user access with 4-digit PINs and token-based API auth

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Chart.js, React Router

**Backend:** Express.js, JSON file storage (no database required), HMAC token auth

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
git clone https://github.com/your-username/budgeting-financial-tool.git
cd budgeting-financial-tool
npm run install:all
```

### Development

```bash
npm run dev
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Production Build

```bash
npm run build
```

---

## API Reference

**Base URL:** `http://localhost:3001/api`

**Authentication:** All endpoints except `/api/auth/*` require a Bearer token:

```
Authorization: Bearer <token>
```

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register (name, pin) |
| POST | `/auth/pin-login` | Login (name, pin) |
| POST | `/auth/set-pin` | Set PIN (userId, pin) |
| POST | `/auth/validate-token` | Validate token |
| GET | `/users` | Current user |
| GET/PUT/DELETE | `/users/:userId` | User CRUD |
| GET/POST | `/users/:userId/categories` | Categories |
| PUT/DELETE | `/users/:userId/categories/:id` | Category by ID |
| GET/POST | `/users/:userId/transactions` | Transactions (query: month, year, type, limit, etc.) |
| PUT/DELETE | `/users/:userId/transactions/:id` | Transaction by ID |
| GET/POST | `/users/:userId/recurring` | Recurring transactions |
| PUT/DELETE | `/users/:userId/recurring/:id` | Recurring by ID |
| POST | `/users/:userId/recurring/:id/process` | Manually process recurring |
| GET | `/users/:userId/stats/summary` | Monthly summary (?month=&year=) |
| GET | `/users/:userId/stats/monthly` | Monthly breakdown (?months=) |
| GET | `/users/:userId/stats/comparison` | Month comparison (?months=) |
| GET | `/users/:userId/export` | Export all data |
| POST | `/users/:userId/import` | Import (data, mode) |

### Key Request/Response Examples

**Register** → returns `{ token, user }`

```json
POST /api/auth/register
{ "name": "mike", "pin": "1234" }
```

**Create transaction** → returns created transaction

```json
POST /api/users/:userId/transactions
{ "amount": 50, "type": "expense", "categoryId": "uuid", "date": "2026-03-06", "notes": "Groceries" }
```

**List transactions** → returns `{ transactions, total, limit, offset }`

```
GET /api/users/:userId/transactions?type=expense&limit=10&month=2&year=2026
```

---

## Example Usage

A few examples to show the pattern. Replace `YOUR_USER_ID` and `YOUR_TOKEN` with values from login/register.

### cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/pin-login \
  -H "Content-Type: application/json" \
  -d '{"name": "mike", "pin": "1234"}'

# Authenticated request
curl http://localhost:3001/api/users/YOUR_USER_ID/categories \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create transaction
curl -X POST http://localhost:3001/api/users/YOUR_USER_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 50, "type": "expense", "categoryId": "CATEGORY_UUID", "date": "2026-03-06"}'
```

### JavaScript (fetch)

```javascript
const BASE = "http://localhost:3001/api";

// Login
const { token, user } = await (await fetch(`${BASE}/auth/pin-login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "mike", pin: "1234" }),
})).json();

// Authenticated helper
async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...opts.headers },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

// Examples
const categories = await api(`/users/${user.id}/categories`);
await api(`/users/${user.id}/transactions`, {
  method: "POST",
  body: JSON.stringify({ amount: 50, type: "expense", categoryId: categories[0].id, date: "2026-03-06" }),
});
const summary = await api(`/users/${user.id}/stats/summary?month=2&year=2026`);
```

### Python

```python
import requests
BASE = "http://localhost:3001/api"

# Login
r = requests.post(f"{BASE}/auth/pin-login", json={"name": "mike", "pin": "1234"})
token, user_id = r.json()["token"], r.json()["user"]["id"]
headers = {"Authorization": f"Bearer {token}"}

# Examples
categories = requests.get(f"{BASE}/users/{user_id}/categories", headers=headers).json()
requests.post(f"{BASE}/users/{user_id}/transactions", headers=headers, json={
    "amount": 50, "type": "expense", "categoryId": categories[0]["id"], "date": "2026-03-06"
})
summary = requests.get(f"{BASE}/users/{user_id}/stats/summary", headers=headers, params={"month": 2, "year": 2026}).json()
```

---

## Error Responses

```json
{ "error": "Authentication required" }
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Missing/invalid token |
| 403 | Access denied |
| 404 | Not found |
| 409 | Conflict (e.g. duplicate username) |
| 429 | Rate limited |
| 500 | Server error |

---

## Project Structure

```
budgeting-financial-tool/
├── backend/          # Express server, auth, routes, JSON storage
├── frontend/         # React app (api/, components/, pages/, etc.)
└── package.json      # Root scripts (dev, build)
```

## License

MIT
