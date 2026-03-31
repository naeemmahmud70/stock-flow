import { create } from "zustand";
import { RestockItem } from "@/types";
import { authFetch } from "@/lib/fetchClient";

interface RestockState {
  items: RestockItem[];
  isLoading: boolean;
  error: string | null;
  fetchQueue: () => Promise<void>;
  restockProduct: (productId: string, addStock: number) => Promise<{ success: boolean; error?: string }>;
}

export const useRestockStore = create<RestockState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await authFetch("/api/restock");
      const data = await res.json();
      if (data.success) set({ items: data.data, isLoading: false });
      else set({ error: data.error, isLoading: false });
    } catch {
      set({ error: "Failed to load restock queue", isLoading: false });
    }
  },

  restockProduct: async (productId, addStock) => {
    try {
      const res = await authFetch("/api/restock", {
        method: "POST",
        body: JSON.stringify({ productId, addStock }),
      });
      const data = await res.json();
      if (data.success) {
        const q = await authFetch("/api/restock");
        const qd = await q.json();
        if (qd.success) set({ items: qd.data });
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "Network error" };
    }
  },
}));
