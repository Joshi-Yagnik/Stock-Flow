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
from app.models.models import User, Customer, Invoice
from pydantic import BaseModel

router = APIRouter()

class CustomerListResponse(PaginatedResponse):
    data: list[CustomerResponse]

class CustomerIdentifier(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

@router.get("/all-identifiers", response_model=list[CustomerIdentifier])
async def list_all_customer_identifiers(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get lightweight list of all customer identifiers for duplicate/added checking."""
    result = await db.execute(
        select(Customer.id, Customer.name, Customer.email, Customer.phone)
        .where(Customer.owner_id == current_user.id)
        .where(Customer.is_active == True)
    )
    rows = result.all()
    return [
        CustomerIdentifier(id=r[0], name=r[1], email=r[2], phone=r[3])
        for r in rows
    ]

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
    clean_search = search.strip() if search else ""

    base_query = (
        select(Customer)
        .where(Customer.owner_id == current_user.id)
        .where(Customer.is_active == is_active)
    )

    if not clean_search:
        # Show customers who have at least one invoice OR show_in_main_list == True
        has_invoice_subquery = (
            select(Invoice.id)
            .where(Invoice.customer_id == Customer.id)
            .where(Invoice.created_by == current_user.id)
            .exists()
        )
        base_query = base_query.where(
            or_(
                has_invoice_subquery,
                Customer.show_in_main_list == True
            )
        )
    else:
        # Search mode: match name, email, phone, company
        search_filter = or_(
            Customer.name.ilike(f"%{clean_search}%"),
            Customer.email.ilike(f"%{clean_search}%"),
            Customer.phone.ilike(f"%{clean_search}%"),
            Customer.company.ilike(f"%{clean_search}%")
        )
        base_query = base_query.where(search_filter)

    # Count query
    count_query = select(func.count()).select_from(base_query.subquery())
    count_res = await db.execute(count_query)
    total = count_res.scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    paginated_query = base_query.order_by(Customer.name.asc()).offset(offset).limit(limit)

    result = await db.execute(paginated_query)
    customers = result.scalars().all()

    # Calculate orders & spent for only the 20 paginated customers returned
    if customers:
        cust_ids = [c.id for c in customers]
        stats_query = (
            select(
                Invoice.customer_id,
                func.count(Invoice.id).label("total_orders"),
                func.coalesce(func.sum(Invoice.total), 0).label("total_spent"),
            )
            .where(Invoice.customer_id.in_(cust_ids))
            .where(Invoice.created_by == current_user.id)
            .group_by(Invoice.customer_id)
        )
        stats_res = await db.execute(stats_query)
        stats_map = {row[0]: (row[1], row[2]) for row in stats_res.all()}

        for c in customers:
            orders, spent = stats_map.get(c.id, (0, 0))
            c.total_orders = int(orders or 0)
            c.total_spent = spent or 0

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
    # Clean email and phone strings
    clean_email = data.email.strip() if data.email and data.email.strip() else None
    clean_phone = data.phone.strip() if data.phone and data.phone.strip() else None

    # Check if customer with this email already exists for this owner
    if clean_email:
        existing_email = await db.execute(
            select(Customer).where(
                Customer.owner_id == current_user.id,
                Customer.email == clean_email
            )
        )
        if existing_email.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer with this email already exists."
            )

    # Check if customer with this phone already exists for this owner
    if clean_phone:
        existing_phone = await db.execute(
            select(Customer).where(
                Customer.owner_id == current_user.id,
                Customer.phone == clean_phone
            )
        )
        if existing_phone.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer with this phone number already exists."
            )

    customer = Customer(
        owner_id=current_user.id,
        name=data.name.strip(),
        email=clean_email,
        phone=clean_phone or "",
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


class BulkContactItem(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    gst_number: Optional[str] = None


class BulkCustomerCreateRequest(BaseModel):
    contacts: list[BulkContactItem]

class BulkCustomerCreateResponse(BaseModel):
    total_count: int
    created_count: int
    skipped_count: int
    data: list[CustomerResponse]


@router.post("/bulk", response_model=BulkCustomerCreateResponse, status_code=status.HTTP_201_CREATED)
async def bulk_create_customers(
    payload: BulkCustomerCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Bulk create customers efficiently and silently handle invalid contact entries."""
    import re
    email_regex = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    existing_res = await db.execute(
        select(Customer).where(Customer.owner_id == current_user.id)
    )
    existing_customers = existing_res.scalars().all()

    existing_emails = {c.email.strip().lower() for c in existing_customers if c.email and c.email.strip()}
    existing_phones = {c.phone.strip() for c in existing_customers if c.phone and c.phone.strip()}

    new_customers = []
    skipped_count = 0
    total_contacts = len(payload.contacts)

    for item in payload.contacts:
        try:
            if not item.name or not item.name.strip():
                skipped_count += 1
                continue

            raw_email = item.email.strip().lower() if item.email and item.email.strip() else None
            clean_email = raw_email if (raw_email and email_regex.match(raw_email)) else None

            raw_phone = item.phone.strip() if item.phone and item.phone.strip() else None
            clean_phone = raw_phone[:20] if raw_phone else "0000000000"

            if clean_email and clean_email in existing_emails:
                skipped_count += 1
                continue
            if clean_phone and clean_phone != "0000000000" and clean_phone in existing_phones:
                skipped_count += 1
                continue

            customer = Customer(
                owner_id=current_user.id,
                name=item.name.strip()[:150],
                email=clean_email,
                phone=clean_phone,
                company=item.company[:200] if item.company else None,
                address=item.address,
                city=item.city[:100] if item.city else None,
                state=item.state[:100] if item.state else None,
                gst_number=item.gst_number[:20] if item.gst_number else None,
            )
            new_customers.append(customer)
            if clean_email:
                existing_emails.add(clean_email)
            if clean_phone and clean_phone != "0000000000":
                existing_phones.add(clean_phone)
        except Exception:
            skipped_count += 1
            continue

    if new_customers:
        db.add_all(new_customers)
        await db.commit()
        for c in new_customers:
            await db.refresh(c)

    return {
        "total_count": total_contacts,
        "created_count": len(new_customers),
        "skipped_count": skipped_count,
        "data": new_customers,
    }


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
