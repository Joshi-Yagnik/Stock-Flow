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
  isActive: data.is_active,
  createdAt: data.created_at,
});

export const getCustomers = async (search?: string): Promise<{ data: Customer[]; total: number }> => {
  const params = search ? { search } : {};
  const response = await api.get('/customers/', { params });
  return {
    data: response.data.data.map(mapCustomer),
    total: response.data.meta.total,
  };
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const response = await api.get(`/customers/${id}`);
  return mapCustomer(response.data);
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  const response = await api.post('/customers/', {
    name: data.name,
    email: data.mobileNumber || undefined,
    phone: data.phone || "",
    company: data.company || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    gst_number: data.gstNumber,
  });
  return mapCustomer(response.data);
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

  const response = await api.patch(`/customers/${id}`, payload);
  return mapCustomer(response.data);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};
