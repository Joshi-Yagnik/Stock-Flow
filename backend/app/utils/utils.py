"""
Utility functions shared across the app.
"""
import math
import uuid
from datetime import datetime, timezone
from typing import TypeVar, Generic, List

from pydantic import BaseModel


def generate_invoice_number(prefix: str = "INV") -> str:
    """Generate a unique invoice number like INV-2024-0001."""
    year = datetime.now(timezone.utc).year
    random_part = str(uuid.uuid4().int)[:4]
    return f"{prefix}-{year}-{random_part}"


def paginate(total: int, page: int, limit: int) -> dict:
    """Return pagination metadata dict."""
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }


def calculate_invoice_totals(
    items: List[dict],
    tax_rate: float,
    discount_amount: float = 0,
) -> dict:
    """
    Calculate subtotal, tax, and total for an invoice.
    Each item must have: unit_price, quantity, discount (%)
    """
    subtotal = sum(
        item["unit_price"] * item["quantity"] * (1 - item.get("discount", 0) / 100)
        for item in items
    )
    tax_amount = subtotal * tax_rate / 100
    total = subtotal + tax_amount - discount_amount
    return {
        "subtotal": round(subtotal, 2),
        "tax_amount": round(tax_amount, 2),
        "total": round(max(total, 0), 2),
    }
