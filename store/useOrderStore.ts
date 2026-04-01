import { create } from "zustand";
import { Order } from "@/types";
import { authFetch } from "@/lib/fetchClient";

interface OrderState {
  orders: Order[];
  total: number;
  pages: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  filters: { status: string; search: string; dateFrom: string; dateTo: string };
  fetchOrders: () => Promise<void>;
  createOrder: (data: {
    customerName: string;
    customerEmail?: string;
    items: { product: string; quantity: number }[];
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (
    id: string,
    status: string,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: string) => Promise<boolean>;
  setFilters: (f: Partial<OrderState["filters"]>) => void;
  setPage: (p: number) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  total: 0,
  pages: 1,
  page: 1,
  isLoading: false,
  error: null,
  filters: { status: "", search: "", dateFrom: "", dateTo: "" },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    const { filters, page } = get();
    const qs = new URLSearchParams({
      page: String(page),
      limit: "20",
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
    });
    try {
      const res = await authFetch(`/api/orders?${qs}`);
      const data = await res.json();
      if (data.success) {
        set({
          orders: data.data,
          total: data.pagination.total,
          pages: data.pagination.pages,
          isLoading: false,
        });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch {
      set({ error: "Failed to fetch orders", isLoading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchOrders();
        set({ isLoading: false });
        return { success: true };
      }
      set({ error: data.error, isLoading: false });
      return { success: false, error: data.error };
    } catch {
      set({ error: "Failed to create order", isLoading: false });
      return { success: false, error: "Network error" };
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const res = await authFetch(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({
          orders: s.orders.map((o) => (o._id === id ? data.data : o)),
        }));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "Network error" };
    }
  },

  deleteOrder: async (id) => {
    try {
      const res = await authFetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ orders: s.orders.filter((o) => o._id !== id) }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f }, page: 1 })),
  setPage: (p) => set({ page: p }),
  clearError: () => set({ error: null }),
}));
