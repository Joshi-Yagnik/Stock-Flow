import api from '../axios';
import type { Customer } from '@/types';

// Map snake_case to camelCase
const mapCustomer = (data: any): Customer => ({
  id: data.id,
  name: data.name,
  mobileNumber: data.email || "", 
  phone: data.phone || "",
  company: data.company,
  address: data.address,
  city: data.city,
  state: data.state,
  gstNumber: data.gst_number,
  totalOrders: data.total_orders || 0,
  totalSpent: data.total_spent || 0,
  showInMainList: data.show_in_main_list || false,
  createdAt: data.created_at,
});

export interface CustomerIdentifier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export const getAllCustomerIdentifiers = async (): Promise<CustomerIdentifier[]> => {
  const response = await api.get('/customers/all-identifiers');
  return response.data;
};

export interface UnifiedCustomerSearchResponse {
  id: string;
  type: 'customer' | 'contact';
  name: string;
  phone?: string;
  email?: string;
  photo?: string;
}

export const searchCustomersAndContacts = async (q: string): Promise<UnifiedCustomerSearchResponse[]> => {
  const response = await api.get('/customers/search', { params: { q } });
  return response.data.data;
};

export const getCustomers = async (
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ data: Customer[]; total: number; totalPages: number }> => {
  const params: Record<string, any> = { page, limit };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const response = await api.get('/customers/', { params });
  return {
    data: response.data.data.map(mapCustomer),
    total: response.data.meta.total,
    totalPages: response.data.meta.total_pages,
  };
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const response = await api.get(`/customers/${id}`);
  return mapCustomer(response.data);
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  const cleanEmail = data.mobileNumber?.trim();
  const cleanPhone = data.phone?.trim() || "";

  const response = await api.post('/customers/', {
    name: data.name?.trim(),
    email: cleanEmail && cleanEmail.length > 0 ? cleanEmail : undefined,
    phone: cleanPhone,
    company: data.company || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    gst_number: data.gstNumber || undefined,
    show_in_main_list: data.showInMainList ?? true,
  });
  return mapCustomer(response.data);
};

export interface BulkCreateResponse {
  totalCount: number;
  createdCount: number;
  skippedCount: number;
  data: Customer[];
}

export const bulkCreateCustomers = async (contacts: Partial<Customer>[]): Promise<BulkCreateResponse> => {
  const payload = contacts.map(c => {
    const cleanEmail = c.mobileNumber?.trim();
    const cleanPhone = c.phone?.trim() || "0000000000";
    return {
      name: c.name?.trim() || "Unnamed",
      email: cleanEmail && cleanEmail.length > 0 ? cleanEmail : undefined,
      phone: cleanPhone,
    };
  });

  const response = await api.post('/customers/bulk', { contacts: payload });
  return {
    totalCount: response.data.total_count || contacts.length,
    createdCount: response.data.created_count,
    skippedCount: response.data.skipped_count,
    data: response.data.data.map(mapCustomer),
  };
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  const payload: Record<string, any> = {};
  if (data.name) payload.name = data.name;
  if (data.mobileNumber) payload.email = data.mobileNumber;
  if (data.phone) payload.phone = data.phone;
  if (data.company) payload.company = data.company;
  if (data.address) payload.address = data.address;
  if (data.city) payload.city = data.city;
  if (data.state) payload.state = data.state;
  if (data.gstNumber) payload.gst_number = data.gstNumber;
  if (data.showInMainList !== undefined) payload.show_in_main_list = data.showInMainList;

  const response = await api.patch(`/customers/${id}`, payload);
  return mapCustomer(response.data);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};
