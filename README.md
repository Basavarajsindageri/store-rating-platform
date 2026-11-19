# Store Rating Platform

A full-stack, production-quality Store Rating Platform built with **Node.js, Express, PostgreSQL, Sequelize ORM, React (Vite), React Router, Axios, and Tailwind CSS**.

The platform features comprehensive Role-Based Access Control (RBAC) across three distinct user roles (**System Administrator**, **Normal User**, **Store Owner**), parameterized queries to safeguard against SQL injection, strict mirrored validation rules, real-time aggregate ratings calculation, server-side sorting, filtering, and pagination.

---

## Tech Stack

- **Backend**: Node.js, Express.js (REST API), Sequelize ORM
- **Database**: PostgreSQL (v18 / v16 / v14)
- **Frontend**: React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide React
- **Authentication**: JWT Bearer Tokens (1-day expiration), bcrypt password hashing (10 salt rounds)
- **Validation**: `express-validator` on backend, mirrored with inline feedback on frontend
- **Security**: Helmet, CORS, Express-Rate-Limit on authentication endpoints, parameterized Sequelize queries

---

## Validation Rules

The following rules are enforced on both backend and frontend:

| Field | Rule | Description |
| :--- | :--- | :--- |
| **Name** | `20 - 60 chars` | Min 20 and max 60 characters |
| **Address** | `$\le 400$ chars` | Max 400 characters |
| **Password** | `8 - 16 chars` | 8-16 characters, $\ge 1$ uppercase letter, $\ge 1$ special character |
| **Email** | Valid format | Standard email address format (`name@domain.com`) |
| **Rating** | Integer `1 - 5` | Integer between 1 and 5 inclusive |

---

## Seeded Credentials

Run `npm run seed` in the `backend` folder to initialize and populate the database with the following demo accounts:

| Role | Name | Email | Password | Assigned Store |
| :--- | :--- | :--- | :--- | :--- |
| **SYSTEM_ADMIN** | System Administrator Account | `admin@example.com` | `Admin@1234` | — |
| **STORE_OWNER** | Alexander Wright Store Owner | `alex.owner@example.com` | `Owner@1234` | Apex Electronics & Gadgets Hub |
| **STORE_OWNER** | Beatrice Vance Store Owner | `beatrice.owner@example.com` | `Owner@1234` | Harvest Organic Grocery Market |
| **STORE_OWNER** | Daniel Morgan Store Owner | `daniel.owner@example.com` | `Owner@1234` | *(Unassigned - available for store creation)* |
| **NORMAL_USER** | Christopher Robin Reviewer | `christopher@example.com` | `User@1234` | — |
| **NORMAL_USER** | Dorothy Gale Customer User | `dorothy@example.com` | `User@1234` | — |
| **NORMAL_USER** | Eleanor Vance Customer User | `eleanor@example.com` | `User@1234` | — |

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL running on `localhost:5432` with database `store_rating_db`

### 1. Database Setup
Create database `store_rating_db` if it does not already exist:
```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE store_rating_db;"
```

### 2. Backend Setup
1. Open terminal in `./backend`:
   ```bash
   cd backend
   ```
2. Verify configuration in `backend/.env` (or copy from `.env.example`):
   ```ini
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=store_rating_db
   JWT_SECRET=9f8e4a7b2c5d1e6f8a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f
   JWT_EXPIRES_IN=1d
   CLIENT_URL=http://localhost:5173
   ```
3. Run migrations and seed data:
   ```bash
   npm run seed
   ```
4. Start backend server:
   ```bash
   npm start
   # Server listens on http://localhost:5000
   ```

### 3. Frontend Setup
1. Open a new terminal in `./frontend`:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   # Access application at http://localhost:5173
   ```

---

## Running Automated Tests

### Backend Integration Tests (22 test suites)
Tests all authentication endpoints, validation errors, RBAC guards, store filtering, rating submission/upsert, and owner dashboard stats:
```bash
cd backend
node test-integration.js
```

### Full End-to-End Browser Tests (24 test suites)
Spins up backend on port 5000, frontend on port 5173, and launches headless Chrome/Edge to execute the complete browser flow for all roles:
```bash
node test-e2e-browser.js
```

---

## REST API Documentation

All routes (except `/api/auth/register`, `/api/auth/login`, and `/api/health`) require a Bearer token:
`Authorization: Bearer <token>`

### 1. Authentication & Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Normal user registration (Name, Email, Password, Address) |
| `POST` | `/api/auth/login` | Public | Universal login for all roles (Returns JWT and User object) |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and assigned store (if any) |
| `PUT` | `/api/auth/change-password` | Authenticated | Update password (`currentPassword`, `newPassword`) |

### 2. System Administrator (`/api/admin`)
*Requires `SYSTEM_ADMIN` role*

| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | — | Platform metrics: total users, total stores, total ratings |
| `GET` | `/api/admin/users` | `?page=&limit=&search=&name=&email=&address=&role=&sortBy=&order=` | List users with filtering, sorting, and pagination |
| `POST` | `/api/admin/users` | `{ name, email, password, address, role }` | Create a user for any role (`SYSTEM_ADMIN`, `NORMAL_USER`, `STORE_OWNER`) |
| `GET` | `/api/admin/users/:id` | — | View user details (includes owned store and store's average rating if store owner) |
| `GET` | `/api/admin/stores` | `?page=&limit=&search=&name=&email=&address=&sortBy=&order=` | List stores with average rating, review count, sorting, and pagination |
| `POST` | `/api/admin/stores` | `{ name, email, address, owner_id }` | Register a new store with optional store owner assignment |
| `GET` | `/api/admin/unassigned-owners` | — | List all store owners without a currently assigned store |

### 3. Stores & Ratings (`/api/stores`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stores` | Authenticated | Browse stores with search (name, address), sorting (name, rating, address), pagination, and the authenticated user's submitted rating |
| `POST` | `/api/stores/:id/rating` | `NORMAL_USER` | Submit or modify rating (`{ rating: 1..5 }`) for a store (upsert) |

### 4. Store Owner (`/api/owner`)
*Requires `STORE_OWNER` role*

| Method | Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/owner/dashboard` | — | Store overview, overall average rating, and 1-5 star breakdown distribution |
| `GET` | `/api/owner/ratings` | `?page=&limit=&search=&sortBy=&order=` | Paginated list of customers who rated their store (Name, Email, Rating, Date) |

### 5. System Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Returns service status and timestamp |

---

## Architecture Highlights
- **Normalized Relational Schema**: Enforced database constraints (CHECK `rating >= 1 AND rating <= 5`, CHECK `20 <= length(name) <= 60`, UNIQUE(`user_id`, `store_id`), UNIQUE(`email`), and UNIQUE(`owner_id`)).
- **Sequelize Subqueries**: Subqueries are used for computing real-time `averageRating` and `ratingCount` with zero GROUP BY side-effects, enabling direct server-side sorting (`?sortBy=rating&order=desc`) and clean pagination.
- **Client & Server Consistency**: Validation schemas are mirrored between `express-validator` and frontend React forms, giving instant character counter and field validation feedback before sending requests.
- **Robust Security**: Protected with `helmet`, configurable CORS origins, rate limiting on sensitive authentication routes, bcrypt password hashing, and role-based route guards on both frontend and backend.
