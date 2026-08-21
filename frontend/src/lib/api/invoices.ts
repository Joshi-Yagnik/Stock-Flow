import api from '../axios';
import type { Invoice, InvoiceStatus } from '@/types';

export interface InvoiceItemCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

export interface InvoiceCreate {
  customer_id: string;
  items: InvoiceItemCreate[];
  tax_rate: number;
  discount_amount: number;
  due_date?: string;
  notes?: string;
  status?: string;
}

export const createInvoice = async (data: InvoiceCreate) => {
  const response = await api.post('/invoices/', data);
  return response.data;
};

// Map backend snake_case response to frontend camelCase type
const mapInvoice = (data: any): Invoice => ({
  id: data.id,
  invoiceNumber: data.invoice_number,
  customerName: data.customer_name,
  customerId: data.customer_id,
  subtotal: parseFloat(data.subtotal) || 0,
  taxAmount: parseFloat(data.tax_amount) || 0,
  taxRate: parseFloat(data.tax_rate) || 18,
  total: parseFloat(data.total) || 0,
  discountAmount: parseFloat(data.discount_amount) || 0,
  status: data.status as InvoiceStatus,
  createdAt: data.created_at,
  dueDate: data.due_date,
  paidAt: data.paid_at,
  items: data.items?.map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unit_price) || 0,
    total: parseFloat(item.total) || 0,
    discount: parseFloat(item.discount) || 0,
  })) || [],
});

export const getInvoices = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  status?: string
): Promise<{ data: Invoice[]; total: number; totalPages: number }> => {
  const params: Record<string, any> = { page, limit };
  if (search && search.trim()) params.search = search.trim();
  if (status && status !== 'all') params.status = status;

  const response = await api.get('/invoices/', { params });
  return {
    data: response.data.data.map(mapInvoice),
    total: response.data.meta.total,
    totalPages: response.data.meta.total_pages,
  };
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  const response = await api.get(`/invoices/${id}`);
  return mapInvoice(response.data);
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<Invoice> => {
  const response = await api.patch(`/invoices/${id}`, { status });
  return mapInvoice(response.data);
};

export const updateInvoice = async (id: string, invoiceData: any): Promise<Invoice> => {
  const response = await api.put(`/invoices/${id}`, invoiceData);
  return mapInvoice(response.data);
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await api.delete(`/invoices/${id}`);
};

export const downloadInvoicePdf = async (id: string): Promise<Blob> => {
  const response = await api.get(`/invoices/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};
