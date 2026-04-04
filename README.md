# StockFlow — Smart Inventory & Order Management

A full-stack Next.js 14 application for managing products, stock levels, customer orders, and fulfillment workflows.

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Backend    | Next.js Route Handlers            |
| Database   | MongoDB + Mongoose                |
| State      | Zustand                           |
| Styling    | TailwindCSS + IBM Plex Sans       |
| Auth       | JWT (httpOnly cookie)             |
| Validation | Zod                               |
| Charts     | Recharts                          |
| Icons      | Lucide React                      |

## Features

- **Authentication** — Signup, Login, Demo login, JWT session
- **Products** — CRUD with category, price, stock, threshold, status
- **Categories** — Create and manage product categories
- **Orders** — Create orders with stock validation and conflict detection
- **Stock Management** — Auto-deduct on order, auto-restore on cancel
- **Restock Queue** — Priority queue for low stock (High/Medium/Low)
- **Activity Log** — Full audit trail of all system actions
- **Dashboard** — Stats, revenue chart, order status chart, product summary

## Getting Started

### 1. Clone and install

```bash
git clone <https://github.com/naeemmahmud70/stock-flow>
cd stockflow
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/stockflow
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d
```

### 3. Run the development server

```bash
npm run dev
```

Open [https://stock-flow-sandy.vercel.app/](https://stock-flow-sandy.vercel.app/) — you'll be redirected to `/login`.

### 4. Demo login

Use the **Demo Login** button on the login page, or create an account at `/signup`.

> For demo login to work, seed a demo user first (see below).

### 5. Seed demo data (optional)

Create a file `scripts/seed.ts` or run this once in a route:

```ts
// POST /api/auth/signup
{
  "name": "Demo User",
  "email": "naeemmahmud370@gmail.com",
  "password": "N@eem123",
  "role": "admin"
}
```

## Project Structure

```
stockflow/
├── app/
│   ├── auth/             ← Login & Signup pages
│   ├── dashboard/        ← Protected dashboard pages
│   │   ├── page.tsx        ← Dashboard home
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── restock/
│   │   └── activity/
│   └── api/                ← Route handlers
│       ├── auth/
│       ├── products/
│       ├── categories/
│       ├── orders/
│       ├── restock/
│       ├── logs/
│       └── dashboard/
├── components/
│   ├── ui/                 ← Shared UI components
│   └── dashboard/          ← Layout components
├── lib/                    ← Utilities
│   ├── db.ts               ← MongoDB singleton
│   ├── auth.ts             ← JWT helpers
│   ├── stock.ts            ← Stock deduction logic
│   ├── conflict.ts         ← Order conflict detection
│   ├── logger.ts           ← Activity logger
│   └── utils.ts            ← Helpers
├── models/                 ← Mongoose schemas
├── store/                  ← Zustand stores
├── types/                  ← TypeScript interfaces
└── middleware.ts           ← JWT route protection
```

## API Reference

### Auth
| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| POST   | `/api/auth/login`  | Login           |
| POST   | `/api/auth/signup` | Register        |
| GET    | `/api/auth/me`     | Current user    |
| DELETE | `/api/auth/me`     | Logout          |

### Products
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | `/api/products`       | List (with filters) |
| POST   | `/api/products`       | Create              |
| PUT    | `/api/products/:id`   | Update              |
| DELETE | `/api/products/:id`   | Delete              |

### Orders
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | `/api/orders`       | List (with filters)  |
| POST   | `/api/orders`       | Create (deducts stock) |
| PUT    | `/api/orders/:id`   | Update status        |
| DELETE | `/api/orders/:id`   | Delete               |

### Other
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | `/api/categories`   | List categories      |
| POST   | `/api/categories`   | Create category      |
| GET    | `/api/restock`      | Restock queue        |
| POST   | `/api/restock`      | Add stock to product |
| GET    | `/api/logs`         | Activity log         |
| GET    | `/api/dashboard`    | Dashboard stats      |

## Business Logic

### Stock deduction
When an order is placed, stock is deducted atomically for all items. If any product is out of stock or has insufficient quantity, the entire order is rejected before any deduction occurs.

### Restock queue
Products are automatically added to the restock queue when their stock falls at or below their `minStockThreshold`. Priority is determined as:
- **High** — stock is 0, or ≤ 50% of threshold
- **Medium** — stock is between 51–100% of threshold

### Conflict detection
- Duplicate products in the same order are blocked client-side and server-side
- Inactive/out-of-stock products cannot be ordered

### Order status transitions
```
pending → confirmed → shipped → delivered
   ↓          ↓
cancelled  cancelled
```
