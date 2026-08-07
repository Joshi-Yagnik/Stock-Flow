"""Products router."""
import math
from fastapi import APIRouter, Depends, Query, HTTPException, status, File, UploadFile
import os
import uuid
import aiofiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import joinedload

from app.database.database import get_db
from app.schemas.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    PaginationMeta,
)
from app.core.dependencies import get_current_active_user, get_current_owner
from app.models.models import User, Product, Category

router = APIRouter()


@router.get("/", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    category_id: str = Query(""),
    sort_by: str = Query("name"),
    is_active: bool = Query(True),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List products with pagination and filtering."""
    query = (
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.is_active == is_active)
        .where(Product.owner_id == current_user.id)
    )

    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.brand.ilike(f"%{search}%")
            )
        )

    if category_id:
        query = query.where(Product.category_id == category_id)

    if sort_by == "name":
        query = query.order_by(Product.name.asc())
    elif sort_by == "-name":
        query = query.order_by(Product.name.desc())
    elif sort_by == "stock":
        query = query.order_by(Product.stock_quantity.asc())
    elif sort_by == "-stock":
        query = query.order_by(Product.stock_quantity.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()

    # Map to response format
    data = []
    for prod in products:
        prod_data = prod.__dict__.copy()
        prod_data["category_name"] = prod.category.name if prod.category else ""
        data.append(prod_data)

    total_pages = math.ceil(total / limit) if limit else 1

    return ProductListResponse(
        meta=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
        ),
        data=data,
    )


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new product."""
    # Validate category
    cat_res = await db.execute(
        select(Category)
        .where(Category.id == data.category_id)
        .where(Category.owner_id == current_user.id)
    )
    category = cat_res.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=400, detail="Category does not exist.")

    # Validate SKU uniqueness
    if data.sku and data.sku.strip():
        sku_res = await db.execute(
            select(Product)
            .where(Product.sku == data.sku)
            .where(Product.owner_id == current_user.id)
        )
        if sku_res.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Product with this SKU already exists.")

    # Validate Barcode uniqueness
    if data.barcode and data.barcode.strip():
        barcode_res = await db.execute(
            select(Product)
            .where(Product.barcode == data.barcode)
            .where(Product.owner_id == current_user.id)
        )
        if barcode_res.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Product with this Barcode already exists.")

    new_product = Product(**data.model_dump(), owner_id=current_user.id)
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)

    # Attach category name for response
    prod_data = new_product.__dict__.copy()
    prod_data["category_name"] = category.name
    return prod_data


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a product by ID."""
    query = (
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.id == product_id)
        .where(Product.owner_id == current_user.id)
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    prod_data = product.__dict__.copy()
    prod_data["category_name"] = product.category.name if product.category else ""
    return prod_data


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a product."""
    query = (
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.id == product_id)
        .where(Product.owner_id == current_user.id)
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    update_data = data.model_dump(exclude_unset=True)

    # Validate Category
    if "category_id" in update_data:
        cat_res = await db.execute(
            select(Category)
            .where(Category.id == update_data["category_id"])
            .where(Category.owner_id == current_user.id)
        )
        if not cat_res.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Category does not exist.")

    # Validate SKU uniqueness
    if "sku" in update_data and update_data["sku"] and update_data["sku"].strip() and update_data["sku"] != product.sku:
        sku_res = await db.execute(
            select(Product)
            .where(Product.sku == update_data["sku"])
            .where(Product.owner_id == current_user.id)
        )
        if sku_res.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Product with this SKU already exists.")

    # Validate Barcode uniqueness
    if "barcode" in update_data and update_data["barcode"] and update_data["barcode"].strip() and update_data["barcode"] != product.barcode:
        barcode_res = await db.execute(
            select(Product)
            .where(Product.barcode == update_data["barcode"])
            .where(Product.owner_id == current_user.id)
        )
        if barcode_res.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Product with this Barcode already exists.")

    for key, value in update_data.items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product)

    # Re-fetch category if it changed
    cat_name = product.category.name if product.category else ""
    if "category_id" in update_data:
        cat_res = await db.execute(select(Category).where(Category.id == product.category_id))
        category = cat_res.scalar_one_or_none()
        cat_name = category.name if category else ""

    prod_data = product.__dict__.copy()
    prod_data["category_name"] = cat_name
    return prod_data


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@router.post("/{product_id}/image")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload and update a product image."""
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .where(Product.owner_id == current_user.id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid image type. Allowed: jpg, jpeg, png, webp")

    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 5MB.")
    
    # Delete old image if it exists
    if product.image_url and product.image_url.startswith("/uploads/products/"):
        old_file_path = product.image_url.lstrip("/")
        if os.path.exists(old_file_path):
            try:
                os.remove(old_file_path)
            except Exception:
                pass

    # Save new image
    new_filename = f"{product_id}-{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join("uploads", "products", new_filename)
    
    async with aiofiles.open(file_path, "wb") as out_file:
        await out_file.write(file_content)
        
    image_url = f"/uploads/products/{new_filename}"
    
    # Update product
    product.image_url = image_url
    await db.commit()
    
    return {"image_url": image_url}


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete a product."""
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .where(Product.owner_id == current_user.id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    product.is_active = False
    await db.commit()
    return None
