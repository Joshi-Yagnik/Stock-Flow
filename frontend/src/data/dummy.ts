import type {
  Category,
  Customer,
  DashboardStats,
  Invoice,
  Product,
  SalesDataPoint,
  CategoryDistribution,
  StockTransaction,
} from "@/types";

export const dashboardStats: DashboardStats = {
  totalProducts: 1248,
  totalCategories: 8,
  totalStock: 48_320,
  todaySales: 284_500,
  monthlyRevenue: 6_820_000,
  lowStockItems: 23,
  totalCustomers: 342,
  pendingInvoices: 18,
  monthlyOrders: 856,
};

// ─── Sales Data (last 7 months) ───────────────────────────────────────────────
export const salesData: SalesDataPoint[] = [
  { date: "Feb", revenue: 4_200_000, orders: 620 },
  { date: "Mar", revenue: 5_100_000, orders: 710 },
  { date: "Apr", revenue: 4_800_000, orders: 680 },
  { date: "May", revenue: 5_900_000, orders: 790 },
  { date: "Jun", revenue: 6_100_000, orders: 820 },
  { date: "Jul", revenue: 5_700_000, orders: 775 },
  { date: "Aug", revenue: 6_820_000, orders: 856 },
];

// ─── Category Distribution ────────────────────────────────────────────────────
export const categoryDistribution: CategoryDistribution[] = [
  { name: "Electronics", value: 34, color: "#3b82f6" },
  { name: "Clothing", value: 22, color: "#8b5cf6" },
  { name: "Groceries", value: 18, color: "#10b981" },
  { name: "Hardware", value: 14, color: "#f59e0b" },
  { name: "Others", value: 12, color: "#6b7280" },
];

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories: Category[] = [
  { id: "cat-1", name: "Electronics", description: "Electronic devices and accessories", color: "#3b82f6", productCount: 245, createdAt: "2024-01-10" },
  { id: "cat-2", name: "Clothing", description: "Apparel and fashion items", color: "#8b5cf6", productCount: 189, createdAt: "2024-01-12" },
  { id: "cat-3", name: "Groceries", description: "Food and daily essentials", color: "#10b981", productCount: 312, createdAt: "2024-01-15" },
  { id: "cat-4", name: "Hardware", description: "Tools and construction materials", color: "#f59e0b", productCount: 178, createdAt: "2024-01-20" },
  { id: "cat-5", name: "Stationery", description: "Office and school supplies", color: "#ef4444", productCount: 134, createdAt: "2024-02-01" },
  { id: "cat-6", name: "Cosmetics", description: "Beauty and personal care", color: "#ec4899", productCount: 96, createdAt: "2024-02-10" },
  { id: "cat-7", name: "Furniture", description: "Home and office furniture", color: "#0891b2", productCount: 64, createdAt: "2024-02-15" },
  { id: "cat-8", name: "Automotive", description: "Car parts and accessories", color: "#65a30d", productCount: 30, createdAt: "2024-03-01" },
];

// ─── Products ─────────────────────────────────────────────────────────────────
export const products: Product[] = [
  { id: "prod-1", name: "Samsung 65\" QLED 4K TV", sku: "SAM-TV-65Q", categoryId: "cat-1", categoryName: "Electronics", sellingPrice: 85_000, purchasePrice: 74_000, gstPercentage: 18, stockQuantity: 42, minimumStock: 10, unit: "pcs", brand: "Samsung", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-08-01" },
  { id: "prod-2", name: "Apple iPhone 15 Pro Max", sku: "APL-IP15PM", categoryId: "cat-1", categoryName: "Electronics", sellingPrice: 1_59_900, purchasePrice: 1_45_000, gstPercentage: 18, stockQuantity: 8, minimumStock: 15, unit: "pcs", brand: "Apple", isActive: true, createdAt: "2024-01-20", updatedAt: "2024-08-01" },
  { id: "prod-3", name: "Men's Formal Shirt (M)", sku: "CLT-SHIRT-M", categoryId: "cat-2", categoryName: "Clothing", sellingPrice: 1_200, purchasePrice: 850, gstPercentage: 5, stockQuantity: 320, minimumStock: 50, unit: "pcs", isActive: true, createdAt: "2024-02-01", updatedAt: "2024-07-28" },
  { id: "prod-4", name: "Basmati Rice 25kg Bag", sku: "GRC-RICE-25", categoryId: "cat-3", categoryName: "Groceries", sellingPrice: 1_800, purchasePrice: 1_550, gstPercentage: 0, stockQuantity: 150, minimumStock: 30, unit: "bags", isActive: true, createdAt: "2024-02-10", updatedAt: "2024-08-02" },
  { id: "prod-5", name: "Bosch Drill Machine", sku: "HDW-DRILL-B", categoryId: "cat-4", categoryName: "Hardware", sellingPrice: 4_500, purchasePrice: 3_800, gstPercentage: 18, stockQuantity: 5, minimumStock: 10, unit: "pcs", brand: "Bosch", isActive: true, createdAt: "2024-02-20", updatedAt: "2024-07-30" },
  { id: "prod-6", name: "Classmate Notebooks (Pack of 6)", sku: "STN-NB-6PK", categoryId: "cat-5", categoryName: "Stationery", sellingPrice: 180, purchasePrice: 140, gstPercentage: 12, stockQuantity: 800, minimumStock: 100, unit: "packs", brand: "Classmate", isActive: true, createdAt: "2024-03-01", updatedAt: "2024-08-01" },
  { id: "prod-7", name: "Dove Body Lotion 400ml", sku: "COS-DOVE-400", categoryId: "cat-6", categoryName: "Cosmetics", sellingPrice: 350, purchasePrice: 280, gstPercentage: 18, stockQuantity: 260, minimumStock: 50, unit: "bottles", brand: "Dove", isActive: true, createdAt: "2024-03-10", updatedAt: "2024-07-25" },
  { id: "prod-8", name: "Office Chair – Ergonomic", sku: "FRN-CHR-ERG", categoryId: "cat-7", categoryName: "Furniture", sellingPrice: 12_000, purchasePrice: 9_500, gstPercentage: 18, stockQuantity: 3, minimumStock: 5, unit: "pcs", isActive: false, createdAt: "2024-03-15", updatedAt: "2024-07-20" },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const customers: Customer[] = [
  { id: "cust-1", name: "Rajesh Sharma", mobileNumber: "rajesh.sharma@gmail.com", phone: "+91 98765 43210", company: "Sharma Enterprises", address: "45 MG Road", city: "Bengaluru", state: "Karnataka", gstNumber: "29AADCS1234F1Z5", totalOrders: 48, totalSpent: 8_24_500, isActive: true, createdAt: "2024-01-10" },
  { id: "cust-2", name: "Priya Patel", mobileNumber: "priya.patel@patelinc.com", phone: "+91 97654 32109", company: "Patel Inc.", address: "12 Ashram Road", city: "Ahmedabad", state: "Gujarat", gstNumber: "24AAKCP5678G1ZM", totalOrders: 36, totalSpent: 5_60_200, isActive: true, createdAt: "2024-01-20" },
  { id: "cust-3", name: "Mohan Gupta", mobileNumber: "mohan@guptabros.co.in", phone: "+91 96543 21098", company: "Gupta Brothers", address: "8 Connaught Place", city: "New Delhi", state: "Delhi", gstNumber: "07AAECG8901H1ZQ", totalOrders: 62, totalSpent: 12_10_000, isActive: true, createdAt: "2024-02-01" },
  { id: "cust-4", name: "Anita Krishnamurthy", mobileNumber: "anita.k@techtraders.com", phone: "+91 95432 10987", company: "Tech Traders", address: "22 Anna Salai", city: "Chennai", state: "Tamil Nadu", totalOrders: 24, totalSpent: 3_45_800, isActive: true, createdAt: "2024-02-15" },
  { id: "cust-5", name: "Suresh Mehta", mobileNumber: "suresh.mehta@retail.com", phone: "+91 94321 09876", address: "16 Park Street", city: "Kolkata", state: "West Bengal", totalOrders: 18, totalSpent: 2_18_500, isActive: false, createdAt: "2024-03-01" },
  { id: "cust-6", name: "Kavita Reddy", mobileNumber: "kavita.r@shopmore.in", phone: "+91 93210 98765", company: "ShopMore Retail", address: "5 Hitech City", city: "Hyderabad", state: "Telangana", gstNumber: "36AAFCR2345I1ZP", totalOrders: 42, totalSpent: 7_80_000, isActive: true, createdAt: "2024-03-10" },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoices: Invoice[] = [
  {
    id: "inv-1", invoiceNumber: "INV-2024-1001", customerId: "cust-1", customerName: "Rajesh Sharma",
    items: [
      { id: "item-1", productId: "prod-1", productName: "Samsung 65\" QLED 4K TV", quantity: 2, unitPrice: 74_000, discount: 5, total: 1_40_600 },
      { id: "item-2", productId: "prod-3", productName: "Men's Formal Shirt (M)", quantity: 50, unitPrice: 850, discount: 0, total: 42_500 },
    ],
    subtotal: 1_83_100, taxRate: 18, taxAmount: 32_958, discountAmount: 7_400, total: 2_08_658,
    status: "paid", dueDate: "2024-07-25", paidAt: "2024-07-22", createdAt: "2024-07-10",
  },
  {
    id: "inv-2", invoiceNumber: "INV-2024-1002", customerId: "cust-2", customerName: "Priya Patel",
    items: [
      { id: "item-3", productId: "prod-6", productName: "Classmate Notebooks", quantity: 200, unitPrice: 140, discount: 10, total: 25_200 },
    ],
    subtotal: 28_000, taxRate: 12, taxAmount: 3_024, discountAmount: 2_800, total: 28_224,
    status: "pending", dueDate: "2024-08-15", createdAt: "2024-07-28",
  },
  {
    id: "inv-3", invoiceNumber: "INV-2024-1003", customerId: "cust-3", customerName: "Mohan Gupta",
    items: [
      { id: "item-4", productId: "prod-2", productName: "Apple iPhone 15 Pro Max", quantity: 5, unitPrice: 1_45_000, discount: 3, total: 7_02_650 },
    ],
    subtotal: 7_25_000, taxRate: 18, taxAmount: 1_27_413, discountAmount: 21_750, total: 8_30_663,
    status: "overdue", dueDate: "2024-07-30", createdAt: "2024-07-05",
  },
  {
    id: "inv-4", invoiceNumber: "INV-2024-1004", customerId: "cust-4", customerName: "Anita Krishnamurthy",
    items: [
      { id: "item-5", productId: "prod-4", productName: "Basmati Rice 25kg Bag", quantity: 30, unitPrice: 1_550, discount: 0, total: 46_500 },
      { id: "item-6", productId: "prod-7", productName: "Dove Body Lotion 400ml", quantity: 100, unitPrice: 280, discount: 5, total: 26_600 },
    ],
    subtotal: 73_100, taxRate: 5, taxAmount: 3_655, discountAmount: 1_400, total: 75_355,
    status: "paid", dueDate: "2024-08-05", paidAt: "2024-08-01", createdAt: "2024-07-20",
  },
  {
    id: "inv-5", invoiceNumber: "INV-2024-1005", customerId: "cust-6", customerName: "Kavita Reddy",
    items: [
      { id: "item-7", productId: "prod-5", productName: "Bosch Drill Machine", quantity: 10, unitPrice: 3_800, discount: 0, total: 38_000 },
    ],
    subtotal: 38_000, taxRate: 18, taxAmount: 6_840, discountAmount: 0, total: 44_840,
    status: "draft", dueDate: "2024-08-20", createdAt: "2024-08-03",
  },
];

// ─── Stock Transactions ───────────────────────────────────────────────────────
export const stockTransactions: StockTransaction[] = [
  { id: "txn-1", productId: "prod-1", productName: "Samsung 65\" QLED 4K TV", type: "sale", quantity: -2, reference: "INV-2024-1001", createdAt: "2024-07-22" },
  { id: "txn-2", productId: "prod-2", productName: "Apple iPhone 15 Pro Max", type: "purchase", quantity: 20, reference: "PO-2024-501", createdAt: "2024-07-18" },
  { id: "txn-3", productId: "prod-3", productName: "Men's Formal Shirt (M)", type: "sale", quantity: -50, reference: "INV-2024-1001", createdAt: "2024-07-22" },
  { id: "txn-4", productId: "prod-4", productName: "Basmati Rice 25kg Bag", type: "purchase", quantity: 100, reference: "PO-2024-502", createdAt: "2024-07-25" },
  { id: "txn-5", productId: "prod-5", productName: "Bosch Drill Machine", type: "adjustment", quantity: -3, notes: "Damaged goods write-off", createdAt: "2024-07-30" },
];

// ─── Low-stock Products ───────────────────────────────────────────────────────
export const lowStockProducts = products.filter((p) => (p.stockQuantity ?? 0) <= (p.minimumStock ?? 10));
