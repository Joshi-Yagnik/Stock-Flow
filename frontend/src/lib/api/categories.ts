import api from '../axios';
import type { Category } from '@/types';

// Map snake_case to camelCase
const mapCategory = (data: any): Category => ({
  id: data.id,
  name: data.name,
  description: data.description,
  color: data.color,
  productCount: data.product_count,
  createdAt: data.created_at,
});

export const getCategories = async (search?: string): Promise<Category[]> => {
  const params = search ? { search } : {};
  const response = await api.get('/categories/', { params });
  return response.data.map(mapCategory);
};

export const getCategory = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`);
  return mapCategory(response.data);
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await api.post('/categories/', {
    name: data.name,
    description: data.description,
    color: data.color,
  });
  return mapCategory(response.data);
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const response = await api.patch(`/categories/${id}`, {
    name: data.name,
    description: data.description,
    color: data.color,
    is_active: true, // We don't expose is_active on the form right now
  });
  return mapCategory(response.data);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
