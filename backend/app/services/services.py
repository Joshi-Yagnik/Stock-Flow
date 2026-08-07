"""
Service layer stubs – business logic to be implemented.
"""
from app.database.database import AsyncSession


class ProductService:
    """Product business logic – CRUD, stock management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_products(self, page: int, limit: int, search: str = "", category_id: str = ""):
        raise NotImplementedError

    async def create_product(self, data: dict):
        raise NotImplementedError

    async def get_product(self, product_id: str):
        raise NotImplementedError

    async def update_product(self, product_id: str, data: dict):
        raise NotImplementedError

    async def delete_product(self, product_id: str):
        raise NotImplementedError

    async def get_low_stock_products(self):
        raise NotImplementedError


class CustomerService:
    """Customer management business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_customers(self, page: int, limit: int, search: str = ""):
        raise NotImplementedError

    async def create_customer(self, data: dict):
        raise NotImplementedError

    async def get_customer(self, customer_id: str):
        raise NotImplementedError


class InvoiceService:
    """Invoice generation and management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_invoice(self, data: dict, created_by: str):
        """Create invoice, calculate totals, deduct stock."""
        raise NotImplementedError

    async def get_invoice(self, invoice_id: str):
        raise NotImplementedError

    async def update_invoice_status(self, invoice_id: str, status: str):
        raise NotImplementedError

    async def generate_invoice_pdf(self, invoice_id: str) -> bytes:
        """Generate PDF using reportlab or weasyprint."""
        raise NotImplementedError


class ReportService:
    """Analytics and reporting queries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_stats(self):
        raise NotImplementedError

    async def get_sales_data(self, period: str, from_date: str, to_date: str):
        raise NotImplementedError

    async def get_category_distribution(self):
        raise NotImplementedError
