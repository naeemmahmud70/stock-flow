"use client";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Bell } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/orders":     "Orders",
  "/dashboard/products":   "Products",
  "/dashboard/categories": "Categories",
  "/dashboard/restock":    "Restock Queue",
  "/dashboard/activity":   "Activity Log",
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const title = PAGE_TITLES[pathname] ?? "StockFlow";

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
