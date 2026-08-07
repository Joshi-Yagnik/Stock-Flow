"""
StockFlow Backend – FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.middleware.logging import LoggingMiddleware
import os
from fastapi.staticfiles import StaticFiles
from app.routers import (
    auth,
    users,
    products,
    categories,
    customers,
    invoices,
    stock_transactions,
    reports,
    settings as settings_router,
)

# Ensure uploads directory exists
os.makedirs("uploads/products", exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Inventory & Billing API for Modern Wholesalers",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Custom Middleware ────────────────────────────────────────────────────────
app.add_middleware(LoggingMiddleware)

# ─── Static Files ─────────────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["Invoices"])
app.include_router(stock_transactions.router, prefix="/api/v1/stock", tags=["Stock"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["Settings"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "StockFlow API is running",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
