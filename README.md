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

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS v4 for styling
- Framer Motion for animations
- Chart.js for data visualization
- React Router for navigation

### Backend
- Express.js
- JSON file-based storage (no database setup required)
- UUID for unique identifiers

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/budgeting-financial-tool.git
cd budgeting-financial-tool
```

2. Install all dependencies:
```bash
npm run install:all
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server at `http://localhost:3001`
- Frontend dev server at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### API Endpoints

#### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user and all data

#### Transactions
- `GET /api/users/:userId/transactions` - List transactions
- `POST /api/users/:userId/transactions` - Create transaction
- `PUT /api/users/:userId/transactions/:id` - Update transaction
- `DELETE /api/users/:userId/transactions/:id` - Delete transaction

#### Categories
- `GET /api/users/:userId/categories` - List categories
- `POST /api/users/:userId/categories` - Create category
- `PUT /api/users/:userId/categories/:id` - Update category
- `DELETE /api/users/:userId/categories/:id` - Delete category

#### Recurring
- `GET /api/users/:userId/recurring` - List recurring transactions
- `POST /api/users/:userId/recurring` - Create recurring
- `PUT /api/users/:userId/recurring/:id` - Update recurring
- `DELETE /api/users/:userId/recurring/:id` - Delete recurring
- `POST /api/users/:userId/recurring/:id/process` - Manually trigger

#### Statistics
- `GET /api/users/:userId/stats/summary` - Current month summary
- `GET /api/users/:userId/stats/monthly?months=6` - Monthly breakdown
- `GET /api/users/:userId/stats/comparison?months=12` - Month comparison

#### Export/Import
- `GET /api/users/:userId/export` - Export all data
- `GET /api/users/:userId/export/month/:year/:month` - Export month
- `GET /api/users/:userId/export/year/:year` - Export year
- `POST /api/users/:userId/import` - Import data

## Project Structure

```
budgeting-financial-tool/
├── backend/
│   ├── data/           # JSON database storage
│   ├── routes/         # API route handlers
│   ├── utils/          # Database and utilities
│   └── server.js       # Express server
├── frontend/
│   ├── src/
│   │   ├── api/        # API client functions
│   │   ├── components/ # React components
│   │   ├── context/    # React context providers
│   │   ├── pages/      # Page components
│   │   └── types/      # TypeScript types
│   └── index.html
└── package.json        # Root package with dev scripts
```

## License

MIT
