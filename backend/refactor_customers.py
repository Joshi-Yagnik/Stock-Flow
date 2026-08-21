import sys
import re

file_path = r'd:\Stock-Flow\backend\app\routers\customers.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update list_all_customer_identifiers
new_identifiers = '''@router.get("/all-identifiers", response_model=list[CustomerIdentifier])
async def list_all_customer_identifiers(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get lightweight list of all customer identifiers for duplicate/added checking."""
    has_invoice_subquery = (
        select(Invoice.id)
        .where(Invoice.customer_id == Customer.id)
        .where(Invoice.created_by == current_user.id)
        .exists()
    )
    result = await db.execute(
        select(Customer.id, Customer.name, Customer.email, Customer.phone)
        .where(Customer.owner_id == current_user.id)
        .where(Customer.is_active == True)
        .where(
            or_(
                has_invoice_subquery,
                Customer.show_in_main_list == True
            )
        )
    )
    rows = result.all()
    return [
        CustomerIdentifier(id=r[0], name=r[1], email=r[2], phone=r[3])
        for r in rows
    ]'''

# Regex to replace the old list_all_customer_identifiers function
content = re.sub(
    r'@router\.get\("/all-identifiers",.*?(?=@router\.get\("/",)',
    new_identifiers + '\n\n',
    content,
    flags=re.DOTALL
)

# 2. Update list_customers logic
list_customers_old = '''    base_query = (
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
        base_query = base_query.where(search_filter)'''

list_customers_new = '''    has_invoice_subquery = (
        select(Invoice.id)
        .where(Invoice.customer_id == Customer.id)
        .where(Invoice.created_by == current_user.id)
        .exists()
    )

    base_query = (
        select(Customer)
        .where(Customer.owner_id == current_user.id)
        .where(Customer.is_active == is_active)
        .where(
            or_(
                has_invoice_subquery,
                Customer.show_in_main_list == True
            )
        )
    )

    if clean_search:
        # Search mode: match name, email, phone, company
        search_filter = or_(
            Customer.name.ilike(f"%{clean_search}%"),
            Customer.email.ilike(f"%{clean_search}%"),
            Customer.phone.ilike(f"%{clean_search}%"),
            Customer.company.ilike(f"%{clean_search}%")
        )
        base_query = base_query.where(search_filter)'''

content = content.replace(list_customers_old, list_customers_new)

# 3. Update create_customer to gracefully recover existing hidden customers
create_customer_old = '''    # Check if customer with this email already exists for this owner
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
            )'''

create_customer_new = '''    # Check if customer with this email already exists for this owner
    existing_customer = None
    if clean_email:
        existing_email = await db.execute(
            select(Customer).where(
                Customer.owner_id == current_user.id,
                Customer.email == clean_email
            )
        )
        existing_customer = existing_email.scalar_one_or_none()

    # Check if customer with this phone already exists for this owner
    if not existing_customer and clean_phone:
        existing_phone = await db.execute(
            select(Customer).where(
                Customer.owner_id == current_user.id,
                Customer.phone == clean_phone
            )
        )
        existing_customer = existing_phone.scalar_one_or_none()
        
    if existing_customer:
        # If it exists, update it to be active and visible in the main list
        existing_customer.is_active = True
        existing_customer.show_in_main_list = True
        
        # Optionally update fields if they were missing, but we keep existing data primarily
        if data.name and not existing_customer.name:
            existing_customer.name = data.name.strip()
            
        await db.commit()
        await db.refresh(existing_customer)
        return existing_customer'''

content = content.replace(create_customer_old, create_customer_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("customers.py refactored successfully")
