# ⚡ StockFlow

> **Smart Inventory & Billing for Modern Wholesalers**

StockFlow is a production-ready, full-stack SaaS application built for wholesale businesses. It provides a modern, intuitive interface for managing products, customers, invoices, and business analytics — all in one place.

---

## 🖼️ Screenshots

| Dashboard | Products | Billing |
|-----------|----------|---------|
| Stats, charts, low stock alerts | Searchable inventory table | Real-time billing with live totals |

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite 5** | Build tool & dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS v3** | Utility-first styling |
| **Shadcn UI / Radix** | Accessible component primitives |
| **React Router v6** | Client-side routing |
| **React Hook Form** | Performant forms |
| **Zod** | Schema validation |
| **TanStack Query** | Server state management |
| **Axios** | HTTP client |
| **Recharts** | Charts & analytics |
| **Sonner** | Toast notifications |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python API |
| **SQLAlchemy 2.0** | Async ORM |
| **PostgreSQL** | Primary database |
| **Alembic** | Database migrations |
| **Pydantic v2** | Data validation |
| **python-jose** | JWT authentication |
| **passlib/bcrypt** | Password hashing |
| **asyncpg** | Async PostgreSQL driver |
| **uvicorn** | ASGI server |

---

## 📁 Folder Structure

```
StockFlow/
├── frontend/                    # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # AppLayout, Navbar, Sidebar
│   │   │   ├── shared/          # PageHeader, SearchBar, DataTable,
│   │   │   │                    # Pagination, StatsCard, EmptyState, Loader
│   │   │   └── ui/              # Button, Card, Input, Badge, Dialog,
│   │   │                        # Select, Tabs, Switch, Avatar, Progress
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx  # Dark/light/system theme
│   │   ├── data/
│   │   │   └── dummy.ts          # Mock data for UI development
│   │   ├── hooks/               # Custom React hooks (future)
│   │   ├── lib/
│   │   │   └── utils.ts          # cn(), formatCurrency, formatDate, etc.
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── billing/         # BillingPage
│   │   │   ├── categories/      # CategoriesPage
│   │   │   ├── customers/       # CustomersPage
│   │   │   ├── dashboard/       # DashboardPage
│   │   │   ├── invoices/        # InvoicesPage
│   │   │   ├── profile/         # ProfilePage
│   │   │   ├── reports/         # ReportsPage
│   │   │   ├── settings/        # SettingsPage
│   │   │   └── NotFoundPage.tsx # 404
│   │   ├── types/
│   │   │   └── index.ts          # All TypeScript interfaces
│   │   ├── App.tsx              # Root component + routes
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global styles + design tokens
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/                     # FastAPI backend
    ├── app/
    │   ├── core/
    │   │   ├── config.py         # App settings (pydantic-settings)
    │   │   └── security.py       # JWT + password hashing
    │   ├── database/
    │   │   └── database.py       # Engine, session, Base, get_db
    │   ├── middleware/
    │   │   └── logging.py        # Request logging middleware
    │   ├── models/
    │   │   └── models.py         # SQLAlchemy ORM models
    │   ├── routers/
    │   │   ├── auth.py           # /auth/login, /refresh, /logout
    │   │   ├── users.py          # /users/me
    │   │   ├── products.py       # /products CRUD
    │   │   ├── categories.py     # /categories CRUD
    │   │   ├── customers.py      # /customers CRUD
    │   │   ├── invoices.py       # /invoices CRUD + PDF
    │   │   ├── stock_transactions.py
    │   │   ├── reports.py        # /reports/dashboard, /sales
    │   │   └── settings.py       # /settings CRUD
    │   ├── schemas/
    │   │   └── schemas.py        # All Pydantic request/response schemas
    │   ├── services/
    │   │   └── services.py       # Business logic layer
    │   └── utils/
    │       └── utils.py          # Shared utility functions
    ├── alembic/
    │   └── env.py               # Async Alembic migrations
    ├── alembic.ini
    ├── main.py                  # FastAPI app entry point
    ├── requirements.txt
    └── .env.example
```

---

## 🗃️ Database Schema

```sql
-- Users
users (id, name, email, hashed_password, role, avatar_url, is_active, last_login, created_at, updated_at)

-- Categories
categories (id, name, description, color, is_active, created_at, updated_at)

-- Products
products (id, name, sku, description, category_id→categories, unit_price, wholesale_price,
          stock, min_stock, unit, image_url, is_active, created_at, updated_at)

-- Customers
customers (id, name, email, phone, company, address, city, state, gst_number, is_active, created_at, updated_at)

-- Invoices
invoices (id, invoice_number, customer_id→customers, created_by→users, subtotal, tax_rate,
          tax_amount, discount_amount, total, status, due_date, paid_at, notes, created_at, updated_at)

-- Invoice Items
invoice_items (id, invoice_id→invoices, product_id→products, quantity, unit_price, discount, total, created_at)

-- Stock Transactions
stock_transactions (id, product_id→products, type, quantity, reference, notes, created_by→users, created_at)

-- App Settings
app_settings (id, company_name, company_email, company_phone, company_address, gst_number,
              currency, tax_rate, invoice_prefix, low_stock_threshold, invoice_footer, logo_url, updated_at)
```

### Entity Relationships
```
users ─────────────────► invoices (created_by)
categories ─────────────► products (category_id)
customers ──────────────► invoices (customer_id)
invoices ───────────────► invoice_items (invoice_id)
products ───────────────► invoice_items (product_id)
products ───────────────► stock_transactions (product_id)
```

---

## 🏃 Installation & Setup

### Prerequisites
- Node.js ≥ 18.0
- Python ≥ 3.11
- PostgreSQL ≥ 15

### 1. Clone & Navigate
```bash
git clone https://github.com/your-org/stockflow.git
cd stockflow
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
# → http://localhost:8000/api/docs
```

### 4. Create PostgreSQL Database
```sql
CREATE USER stockflow_user WITH PASSWORD 'stockflow_pass';
CREATE DATABASE stockflow_db OWNER stockflow_user;
GRANT ALL PRIVILEGES ON DATABASE stockflow_db TO stockflow_user;
```

---

## 🔑 Default Credentials (Dev Mode)

| Field | Value |
|---|---|
| Email | `admin@stockflow.app` |
| Password | `password123` |

---

## 📡 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints
```
POST   /api/v1/auth/login           → Get JWT tokens
POST   /api/v1/auth/refresh         → Refresh access token

GET    /api/v1/products             → List products (paginated)
POST   /api/v1/products             → Create product
PATCH  /api/v1/products/{id}        → Update product

GET    /api/v1/invoices             → List invoices
POST   /api/v1/invoices             → Create invoice
GET    /api/v1/invoices/{id}/pdf    → Download PDF

GET    /api/v1/reports/dashboard    → Dashboard KPIs
GET    /api/v1/reports/sales        → Sales analytics
GET    /api/v1/stock/low-stock      → Low stock products
```

---

## 🎨 Design System

StockFlow uses a custom design system built on Tailwind CSS:

| Token | Light | Dark |
|---|---|---|
| `--primary` | Blue 500 | Blue 400 |
| `--background` | White | Gray 950 |
| `--card` | White | Gray 900 |
| `--border` | Gray 200 | Gray 800 |

### Typography
- Font: **Inter** (Google Fonts)
- Weights: 300 / 400 / 500 / 600 / 700 / 800

### Shadows
- `shadow-soft` – subtle card shadow
- `shadow-card` – card elevation
- `shadow-card-hover` – hover state
- `shadow-elevated` – modals & dropdowns

---

## 🗺️ Pages Overview

| Route | Page | Description |
|---|---|---|
| `/login` | Login | JWT authentication with form validation |
| `/register` | Register | Account creation with password rules |
| `/dashboard` | Dashboard | KPI cards, charts, recent invoices |
| `/products` | Products | Inventory table with CRUD |
| `/categories` | Categories | Card grid with color tags |
| `/customers` | Customers | Customer list with contact info |
| `/billing` | Billing | Real-time invoice builder |
| `/invoices` | Invoices | Invoice list with status filters |
| `/reports` | Reports | Charts, top products, analytics |
| `/settings` | Settings | Company, theme, billing config |
| `/profile` | Profile | User info and activity history |
| `*` | 404 | Not found page |

---

## 🔮 Planned Future Features

| Feature | Description |
|---|---|
| 📧 **Email Notifications** | Invoice PDFs sent via SMTP |
| 📱 **PWA Support** | Installable mobile experience |
| 🏷️ **Barcode Scanner** | Scan product barcodes for billing |
| 📦 **Purchase Orders** | Manage supplier POs and stock replenishment |
| 👥 **Multi-user Roles** | Admin / Manager / Staff permissions |
| 🔔 **Real-time Alerts** | WebSocket low-stock and overdue notifications |
| 📊 **Advanced Analytics** | Cohort analysis, customer LTV, demand forecasting |
| 🌐 **Multi-currency** | Support USD, EUR, INR simultaneously |
| 🖨️ **Thermal Printing** | Direct thermal receipt printing |
| 📱 **Mobile App** | React Native companion app |
| 🔗 **Integrations** | Tally, QuickBooks, Shopify sync |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using React, FastAPI, and PostgreSQL</p>
  <p>⚡ StockFlow – Smart Inventory & Billing for Modern Wholesalers</p>
</div>