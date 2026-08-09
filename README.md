# ⚡ StockFlow

> **Smart Inventory & Billing for Modern Wholesalers**

StockFlow is a production-ready, full-stack SaaS application built for wholesale businesses. It provides a modern, intuitive interface for managing products, customers, invoices, and business analytics — all in one place.

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
| **TanStack Query** | Server state management |
| **Recharts** | Charts & analytics |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python API |
| **SQLAlchemy 2.0** | Async ORM |
| **PostgreSQL** | Primary database |
| **Alembic** | Database migrations |
| **Pydantic v2** | Data validation |
| **python-jose** | JWT authentication |

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

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using React, FastAPI, and PostgreSQL</p>
  <p>⚡ StockFlow – Smart Inventory & Billing for Modern Wholesalers</p>
</div>