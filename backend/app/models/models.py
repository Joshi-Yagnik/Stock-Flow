"""
SQLAlchemy ORM Models – Users, Categories, Products, Customers,
Invoices, InvoiceItems, StockTransactions, Settings
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Enum as SAEnum,
    func,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

# ─── Helpers ──────────────────────────────────────────────────────────────────
def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ─── User ─────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        SAEnum("owner", "staff", name="user_role"),
        default="staff",
        nullable=False,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    # Relationships
    invoices: Mapped[List["Invoice"]] = relationship(back_populates="created_by_user")
    categories: Mapped[List["Category"]] = relationship(back_populates="owner")
    products: Mapped[List["Product"]] = relationship(back_populates="owner")


# ─── Category ─────────────────────────────────────────────────────────────────
class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("owner_id", "name", name="uix_category_owner_name"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    color: Mapped[str] = mapped_column(String(20), default="#3b82f6")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="categories")
    products: Mapped[List["Product"]] = relationship(back_populates="category")


# ─── Product ──────────────────────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    sku: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    barcode: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"), nullable=False)
    purchase_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    gst_percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True, default=18)
    stock_quantity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=0)
    minimum_stock: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=10)
    unit: Mapped[str] = mapped_column(String(50), default="pcs")
    brand: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="products")
    category: Mapped["Category"] = relationship(back_populates="products")
    invoice_items: Mapped[List["InvoiceItem"]] = relationship(back_populates="product")
    stock_transactions: Mapped[List["StockTransaction"]] = relationship(back_populates="product")


# ─── Customer ─────────────────────────────────────────────────────────────────
class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(200))
    address: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    gst_number: Mapped[Optional[str]] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    # Relationships
    invoices: Mapped[List["Invoice"]] = relationship(back_populates="customer")


# ─── Invoice ──────────────────────────────────────────────────────────────────
class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), nullable=False)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=18)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    status: Mapped[str] = mapped_column(
        SAEnum("draft", "pending", "paid", "overdue", "cancelled", name="invoice_status"),
        default="draft",
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    # Relationships
    customer: Mapped["Customer"] = relationship(back_populates="invoices")
    created_by_user: Mapped["User"] = relationship(back_populates="invoices")
    items: Mapped[List["InvoiceItem"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )


# ─── Invoice Item ─────────────────────────────────────────────────────────────
class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    invoice_id: Mapped[str] = mapped_column(ForeignKey("invoices.id"), nullable=False)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    invoice: Mapped["Invoice"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="invoice_items")


# ─── Stock Transaction ────────────────────────────────────────────────────────
class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False)
    type: Mapped[str] = mapped_column(
        SAEnum("purchase", "sale", "adjustment", "return", name="transaction_type"),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)  # negative for outflow
    reference: Mapped[Optional[str]] = mapped_column(String(100))  # Invoice # / PO #
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    product: Mapped["Product"] = relationship(back_populates="stock_transactions")


# ─── App Settings ─────────────────────────────────────────────────────────────
class AppSettings(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_name: Mapped[str] = mapped_column(String(200), default="StockFlow")
    company_email: Mapped[Optional[str]] = mapped_column(String(255))
    company_phone: Mapped[Optional[str]] = mapped_column(String(20))
    company_address: Mapped[Optional[str]] = mapped_column(Text)
    gst_number: Mapped[Optional[str]] = mapped_column(String(20))
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=18)
    invoice_prefix: Mapped[str] = mapped_column(String(20), default="INV")
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=10)
    invoice_footer: Mapped[Optional[str]] = mapped_column(Text)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
