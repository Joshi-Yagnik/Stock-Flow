"""Customers router."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.database.database import get_db
from app.schemas.schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    PaginatedResponse,
)
from app.core.dependencies import get_current_active_user
from app.models.models import User, Customer
from pydantic import BaseModel

router = APIRouter()

class CustomerListResponse(PaginatedResponse):
    data: list[CustomerResponse]

@router.get("/", response_model=CustomerListResponse)
async def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    is_active: bool = Query(True),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List customers for the authenticated user."""
    query = (
        select(Customer)
        .where(Customer.owner_id == current_user.id)
        .where(Customer.is_active == is_active)
    )

    if search:
        query = query.where(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                Customer.company.ilike(f"%{search}%")
            )
        )

    query = query.order_by(Customer.name.asc())

    # Pagination
    offset = (page - 1) * limit
    paginated_query = query.offset(offset).limit(limit)

    result = await db.execute(paginated_query)
    customers = result.scalars().all()

    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return {
        "data": customers,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit if total > 0 else 1,
        }
    }


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    data: CustomerCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new customer for the authenticated user."""
    # Check if mobile already exists for this user
    existing = await db.execute(
        select(Customer).where(
            Customer.owner_id == current_user.id,
            Customer.email == data.email
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this email already exists."
        )

    customer = Customer(
        owner_id=current_user.id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        company=data.company,
        address=data.address,
        city=data.city,
        state=data.state,
        gst_number=data.gst_number,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific customer."""
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.owner_id == current_user.id
        )
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    data: CustomerUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a specific customer."""
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.owner_id == current_user.id
        )
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if hasattr(customer, key):
            setattr(customer, key, value)

    await db.commit()
    await db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a customer."""
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.owner_id == current_user.id
        )
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    await db.delete(customer)
    await db.commit()
