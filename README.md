<div align="center">
  <h1>⚡ StockFlow</h1>
  <p><strong>Smart Inventory & Billing for Modern Wholesalers</strong></p>
  
  <p>
    <a href="https://github.com/anuj-kanthariya/Stock-Flow/stargazers"><img src="https://img.shields.io/github/stars/anuj-kanthariya/Stock-Flow?style=flat-square&color=blue" alt="Stars"></a>
    <a href="https://github.com/anuj-kanthariya/Stock-Flow/network/members"><img src="https://img.shields.io/github/forks/anuj-kanthariya/Stock-Flow?style=flat-square&color=blue" alt="Forks"></a>
    <a href="https://github.com/anuj-kanthariya/Stock-Flow/issues"><img src="https://img.shields.io/github/issues/anuj-kanthariya/Stock-Flow?style=flat-square&color=blue" alt="Issues"></a>
    <a href="https://github.com/anuj-kanthariya/Stock-Flow/blob/main/LICENSE"><img src="https://img.shields.io/github/license/anuj-kanthariya/Stock-Flow?style=flat-square&color=blue" alt="License"></a>
  </p>
</div>

---

**StockFlow** is a production-ready, full-stack SaaS application built for wholesale businesses. It provides a modern, intuitive interface for managing products, customers, invoices, and business analytics — all in one centralized platform.

## 📑 Table of Contents
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## ✨ Key Features

- **Real-Time Inventory Management**: Track stock levels, set low-stock alerts, and manage product variations effortlessly.
- **Smart Billing & Invoicing**: Generate dynamic PDF invoices, apply automated tax calculations, and process instant billing.
- **Advanced Analytics Dashboard**: Gain insights with visual data representations, sales tracking, and KPI monitoring.
- **Role-Based Access Control**: Secure authentication and authorization for different user levels (Admin, Manager, Staff).
- **Responsive & Modern UI**: A clean, accessible, and fully responsive interface powered by Tailwind CSS and Radix UI.

---

## 🚀 Tech Stack

### Frontend Architecture
- **Framework**: React 18 & Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3, Shadcn UI
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Data Visualization**: Recharts

### Backend Architecture
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM & Migrations**: SQLAlchemy 2.0 & Alembic
- **Validation**: Pydantic v2
- **Security**: JWT Authentication (python-jose), Passlib (bcrypt)

---

## 🏃 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [Python](https://www.python.org/) (v3.11 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v15 or higher)

### 1. Installation

Clone the repository and set up the frontend and backend environments:

```bash
git clone https://github.com/anuj-kanthariya/Stock-Flow.git
cd Stock-Flow
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Application will run on http://localhost:5173
```

#### Backend Setup
```bash
cd backend

<<<<<<< HEAD
# Create and activate virtual environment
python -m venv .venv
# Windows: .venv\Scripts\activate 
# macOS/Linux: source .venv/bin/activate
=======
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate
# Activate on macOS/Linux
# source venv/bin/activate
>>>>>>> bd1a262 (Google Contacts Imported)

# Install dependencies
pip install -r requirements.txt

<<<<<<< HEAD
# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials
=======
# Configure environment
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations
alembic upgrade head

# Start backend
uvicorn main:app --reload
# → http://localhost:8000/api/docs
>>>>>>> bd1a262 (Google Contacts Imported)
```

### 2. Database Configuration

Create the PostgreSQL database and user:
```sql
CREATE USER stockflow_user WITH PASSWORD 'stockflow_pass';
CREATE DATABASE stockflow_db OWNER stockflow_user;
GRANT ALL PRIVILEGES ON DATABASE stockflow_db TO stockflow_user;
```

Apply database migrations and start the server:
```bash
alembic upgrade head
uvicorn main:app --reload --port 8000
# API will run on http://localhost:8000
```

### 3. Default Credentials (Dev Mode)
| Role | Email | Password |
|---|---|---|
| Administrator | `admin@stockflow.app` | `password123` |

---

## 📡 API Reference

StockFlow provides a fully documented RESTful API out of the box. Once the backend server is running, you can access the interactive documentation:

- **Swagger UI**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **ReDoc**: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

### Core Endpoints Overview
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT |
| `GET` | `/api/v1/products` | Retrieve paginated products |
| `POST` | `/api/v1/invoices` | Generate a new invoice |
| `GET` | `/api/v1/reports/dashboard` | Fetch KPI dashboard metrics |

---

## 🗺️ Project Structure (Pages)

| Route | View | Primary Function |
|---|---|---|
| `/dashboard` | **Dashboard** | Overview of KPI metrics, charts, and recent activity |
| `/products` | **Inventory** | Comprehensive product management and tracking |
| `/billing` | **Point of Sale** | Real-time invoice generation and checkout |
| `/invoices` | **Ledger** | Historical records of all transactions |
| `/reports` | **Analytics** | Deep dive into sales performance and trends |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Engineered with ❤️ for modern businesses.</p>
</div>