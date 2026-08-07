"""Customers router stubs."""
from fastapi import APIRouter, Query
from app.schemas.schemas import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter()


@router.get("/")
async def list_customers(page: int = Query(1, ge=1), limit: int = Query(20), search: str = Query("")):
    raise NotImplementedError


@router.post("/", response_model=CustomerResponse, status_code=201)
async def create_customer(data: CustomerCreate):
    raise NotImplementedError


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str):
    raise NotImplementedError


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: str, data: CustomerUpdate):
    raise NotImplementedError


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: str):
    raise NotImplementedError
