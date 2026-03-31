export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager";
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  category: Category | string;
  price: number;
  stock: number;
  minStockThreshold: number;
  status: "active" | "out_of_stock";
  sku?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product | string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestockItem {
  _id: string;
  product: Product;
  currentStock: number;
  threshold: number;
  priority: "high" | "medium" | "low";
  addedAt: string;
}

export interface ActivityLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  user: User | string;
  userName: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  totalOrdersToday: number;
  pendingOrders: number;
  completedOrders: number;
  revenueToday: number;
  lowStockCount: number;
  productSummary: Array<{
    _id: string;
    name: string;
    stock: number;
    minStockThreshold: number;
    status: string;
  }>;
  recentOrders: Order[];
  ordersByStatus: Array<{ _id: string; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type OrderStatus = Order["status"];
export type ProductStatus = Product["status"];
export type Priority = RestockItem["priority"];
