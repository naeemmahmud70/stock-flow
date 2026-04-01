import { create } from "zustand";
import { Product, Category } from "@/types";
import { authFetch } from "@/lib/fetchClient";

interface ProductState {
  products: Product[];
  categories: Category[];
  total: number;
  pages: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  filters: { search: string; category: string; status: string };
  fetchProducts: (params?: Record<string, string>) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  createCategory: (data: {
    name: string;
    description?: string;
  }) => Promise<boolean>;
  setFilters: (filters: Partial<ProductState["filters"]>) => void;
  setPage: (page: number) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  total: 0,
  pages: 1,
  page: 1,
  isLoading: false,
  error: null,
  filters: { search: "", category: "", status: "" },

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    const { filters, page } = get();
    const qs = new URLSearchParams({
      page: String(page),
      limit: "20",
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.status && { status: filters.status }),
      ...params,
    });
    try {
      const res = await authFetch(`/api/products?${qs}`);
      const data = await res.json();
      if (data.success) {
        set({
          products: data.data,
          total: data.pagination.total,
          pages: data.pagination.pages,
          isLoading: false,
        });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch {
      set({ error: "Failed to fetch products", isLoading: false });
    }
  },

  fetchCategories: async () => {
    const res = await authFetch("/api/categories");
    const data = await res.json();
    if (data.success) set({ categories: data.data });
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchProducts();
        return true;
      }
      set({ error: data.error, isLoading: false });
      return false;
    } catch {
      set({ error: "Failed to create product", isLoading: false });
      return false;
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authFetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({
          products: s.products.map((p) => (p._id === id ? data.data : p)),
          isLoading: false,
        }));
        return true;
      }
      set({ error: data.error, isLoading: false });
      return false;
    } catch {
      set({ error: "Failed to update product", isLoading: false });
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await authFetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ products: s.products.filter((p) => p._id !== id) }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  createCategory: async (catData) => {
    try {
      const res = await authFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(catData),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchCategories();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch {
      return false;
    }
  },

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters }, page: 1 })),
  setPage: (page) => set({ page }),
}));
