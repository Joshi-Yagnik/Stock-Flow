"""Stock transactions router stubs."""
from fastapi import APIRouter, Query
from app.schemas.schemas import StockTransactionCreate, StockTransactionResponse

router = APIRouter()


@router.get("/transactions")
async def list_transactions(
    product_id: str = Query(""),
    type: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(20),
):
    raise NotImplementedError


@router.post("/transactions", response_model=StockTransactionResponse, status_code=201)
async def create_transaction(data: StockTransactionCreate):
    raise NotImplementedError


@router.get("/low-stock")
async def get_low_stock_products():
    """List products below their minimum stock threshold."""
    raise NotImplementedError
