// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  mobileNumber: string;
  role: "admin" | "manager" | "staff";
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  productCount: number;
  createdAt: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  categoryId: string;
  categoryName: string;
  description?: string | null;
  purchasePrice?: number | null;
  sellingPrice: number;
  gstPercentage?: number | null;
  stockQuantity?: number | null;
  minimumStock?: number | null;
  unit: string;
  brand?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  gstNumber?: string;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

// ─── Stock Transaction ────────────────────────────────────────────────────────
export type TransactionType = "purchase" | "sale" | "adjustment" | "return";

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  todaySales: number;
  monthlyRevenue: number;
  lowStockItems: number;
  totalCustomers: number;
  pendingInvoices: number;
  monthlyOrders: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Settings ────────────────────────────────────────────────────────────────
export interface AppSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  gstNumber?: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  lowStockThreshold: number;
  theme: "light" | "dark" | "system";
}
