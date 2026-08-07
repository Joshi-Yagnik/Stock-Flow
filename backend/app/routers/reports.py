"""Reports router stubs."""
from fastapi import APIRouter, Query
from app.schemas.schemas import DashboardStats

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """Aggregate dashboard KPIs."""
    raise NotImplementedError


@router.get("/sales")
async def get_sales_report(
    period: str = Query("monthly", pattern="^(daily|weekly|monthly|yearly)$"),
    from_date: str = Query(""),
    to_date: str = Query(""),
):
    raise NotImplementedError


@router.get("/products/top")
async def get_top_products(limit: int = Query(10, ge=1, le=50)):
    raise NotImplementedError


@router.get("/categories/distribution")
async def get_category_distribution():
    raise NotImplementedError
