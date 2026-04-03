# 💰 Finance Dashboard Backend

A full-stack finance dashboard system built with **Next.js**, **Express.js**, and **SQLite**. It supports role-based access control, financial record management, and dashboard analytics.

---

## 🏗️ Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | Next.js 15 (App Router)        |
| Backend API | Express.js 5 (TypeScript)      |
| Database    | SQLite via `better-sqlite3`    |
| Auth        | JWT (`jsonwebtoken` + `bcryptjs`) |
| Validation  | Zod                            |
| Rate Limit  | `express-rate-limit`           |

---

## 📁 Project Structure

```
├── server/
│   └── src/
│       ├── index.ts              # Express app entry point
│       ├── db/
│       │   ├── database.ts       # SQLite connection
│       │   └── migrate.ts        # Schema & seed data
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── user.routes.ts
│       │   ├── record.routes.ts
│       │   └── dashboard.routes.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── user.controller.ts
│       │   ├── record.controller.ts
│       │   └── dashboard.controller.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── user.service.ts
│       │   ├── record.service.ts
│       │   └── dashboard.service.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts     # JWT verification
│       │   ├── role.middleware.ts     # Role-based access
│       │   └── validate.middleware.ts # Zod validation
│       ├── validators/
│       │   ├── auth.validator.ts
│       │   ├── record.validator.ts
│       │   └── user.validator.ts
│       ├── models/
│       │   └── types.ts              # TypeScript interfaces
│       └── utils/
│           ├── jwt.ts
│           ├── password.ts
│           └── response.ts
├── src/                              # Next.js frontend
├── data/                             # SQLite DB file (auto-created)
├── .env.local                        # Environment variables
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd Zorvyn

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Or create .env.local manually with the variables below

# 4. Start development servers (Next.js + Express)
npm run dev
```

### Environment Variables (`.env.local`)

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
DB_PATH=./data/finance.db
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### NPM Scripts

| Script             | Description                                |
|--------------------|--------------------------------------------|
| `npm run dev`      | Start both Next.js + Express concurrently  |
| `npm run dev:next` | Start Next.js only (port 3000)             |
| `npm run dev:server` | Start Express API only (port 4000)       |
| `npm run build`    | Build Next.js for production               |
| `npm run server:build` | Compile Express TypeScript to JS       |

---

## 🔐 Authentication & Roles

### Roles & Permissions

| Action                    | Viewer | Analyst | Admin |
|---------------------------|:------:|:-------:|:-----:|
| View records              |   ✅   |   ✅    |  ✅   |
| View dashboard/analytics  |   ❌   |   ✅    |  ✅   |
| Create/Update/Delete records |  ❌  |   ❌    |  ✅   |
| Manage users              |   ❌   |   ❌    |  ✅   |

### Default Admin Account
On first startup, a default admin is seeded:
- **Email:** `admin@finance.com`
- **Password:** `Admin@1234`

> ⚠️ Change this password immediately in production.

---

## 📡 API Reference

**Base URL:** `http://localhost:4000/api`

### Health Check
```
GET /api/health
```

### Auth Endpoints

| Method | Endpoint           | Body                                      | Auth |
|--------|--------------------|--------------------------------------------|------|
| POST   | `/api/auth/register` | `{ name, email, password, role? }`       | No   |
| POST   | `/api/auth/login`    | `{ email, password }`                    | No   |
| GET    | `/api/auth/me`       | —                                        | Yes  |

### User Management (Admin only)

| Method | Endpoint            | Body                             |
|--------|---------------------|----------------------------------|
| GET    | `/api/users`        | —                                |
| GET    | `/api/users/:id`    | —                                |
| PATCH  | `/api/users/:id`    | `{ name?, role?, is_active? }`   |
| DELETE | `/api/users/:id`    | — (soft deactivate)              |

### Financial Records

| Method | Endpoint             | Body / Params                               | Role   |
|--------|----------------------|---------------------------------------------|--------|
| GET    | `/api/records`       | `?type=income&category=food&dateFrom=...&dateTo=...&page=1&limit=20` | Any    |
| GET    | `/api/records/:id`   | —                                           | Any    |
| POST   | `/api/records`       | `{ amount, type, category, date, notes? }`  | Admin  |
| PATCH  | `/api/records/:id`   | `{ amount?, type?, category?, date?, notes? }` | Admin |
| DELETE | `/api/records/:id`   | — (soft delete)                             | Admin  |

### Dashboard Analytics (Analyst + Admin)

| Method | Endpoint                       | Params           |
|--------|--------------------------------|------------------|
| GET    | `/api/dashboard/summary`       | —                |
| GET    | `/api/dashboard/categories`    | `?type=income`   |
| GET    | `/api/dashboard/trends/monthly`| `?months=12`     |
| GET    | `/api/dashboard/trends/weekly` | —                |
| GET    | `/api/dashboard/recent`        | `?limit=10`      |

---

## 🛡️ Features Implemented

### Core
- ✅ User registration & login with JWT
- ✅ Role-based access control (Viewer / Analyst / Admin)
- ✅ Financial records CRUD with validation
- ✅ Dashboard summary APIs (income, expenses, net balance)
- ✅ Category-wise breakdown
- ✅ Monthly & weekly trend analytics
- ✅ Recent activity feed

### Enhancements
- ✅ Token-based authentication (Bearer JWT)
- ✅ Pagination for record listing
- ✅ Soft delete for records AND users
- ✅ Rate limiting (100 req / 15 min)
- ✅ Input validation with Zod
- ✅ Standardized API response format
- ✅ Proper HTTP status codes
- ✅ Global error handling
- ✅ Database indexing for performance

---

## 🗄️ Data Modeling

### Users Table
| Column        | Type    | Constraints                              |
|---------------|---------|------------------------------------------|
| id            | INTEGER | PRIMARY KEY, AUTOINCREMENT               |
| name          | TEXT    | NOT NULL                                 |
| email         | TEXT    | NOT NULL, UNIQUE                         |
| password_hash | TEXT    | NOT NULL                                 |
| role          | TEXT    | CHECK(viewer/analyst/admin), DEFAULT viewer |
| is_active     | INTEGER | CHECK(0/1), DEFAULT 1                    |
| created_at    | TEXT    | DEFAULT datetime('now')                  |
| updated_at    | TEXT    | DEFAULT datetime('now')                  |

### Financial Records Table
| Column     | Type    | Constraints                              |
|------------|---------|------------------------------------------|
| id         | INTEGER | PRIMARY KEY, AUTOINCREMENT               |
| amount     | REAL    | NOT NULL, CHECK(> 0)                     |
| type       | TEXT    | CHECK(income/expense)                    |
| category   | TEXT    | NOT NULL                                 |
| date       | TEXT    | NOT NULL (YYYY-MM-DD)                    |
| notes      | TEXT    | NULLABLE                                 |
| is_deleted | INTEGER | DEFAULT 0 (soft delete)                  |
| created_by | INTEGER | FOREIGN KEY → users(id)                  |
| created_at | TEXT    | DEFAULT datetime('now')                  |
| updated_at | TEXT    | DEFAULT datetime('now')                  |

---

## 📝 Design Decisions & Assumptions

1. **SQLite** chosen for simplicity — zero config, file-based, ideal for development and small-scale deployments.
2. **Soft delete** implemented for both users (deactivation) and records — no data is permanently lost.
3. **Role hierarchy**: Admin > Analyst > Viewer. Higher roles inherit all permissions of lower roles.
4. **Password hashing** uses bcrypt with 10 salt rounds.
5. **JWT tokens** include userId, email, and role in the payload for stateless auth.
6. **Zod validation** runs at the middleware level before any controller logic executes.
7. **Rate limiting** is applied globally to all `/api` routes (100 requests per 15 minutes per IP).
8. The default admin is seeded on first migration for immediate testability.

---

## 📄 License

MIT
