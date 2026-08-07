"""Invoices router stubs."""
from fastapi import APIRouter, Query
from app.schemas.schemas import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceListResponse

router = APIRouter()


@router.get("/", response_model=InvoiceListResponse)
async def list_invoices(
    page: int = Query(1, ge=1),
    limit: int = Query(20),
    status: str = Query(""),
    customer_id: str = Query(""),
    search: str = Query(""),
):
    raise NotImplementedError


@router.post("/", response_model=InvoiceResponse, status_code=201)
async def create_invoice(data: InvoiceCreate):
    raise NotImplementedError


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str):
    raise NotImplementedError


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(invoice_id: str, data: InvoiceUpdate):
    raise NotImplementedError


@router.delete("/{invoice_id}", status_code=204)
async def delete_invoice(invoice_id: str):
    raise NotImplementedError


@router.get("/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str):
    """Generate and return invoice PDF."""
    raise NotImplementedError
