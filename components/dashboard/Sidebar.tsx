"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, RefreshCw,
  Activity, Tag, LogOut, Package2, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/dashboard",            label: "Dashboard",    icon: LayoutDashboard },
  { href: "/dashboard/orders",     label: "Orders",       icon: ShoppingCart },
  { href: "/dashboard/products",   label: "Products",     icon: Package },
  { href: "/dashboard/categories", label: "Categories",   icon: Tag },
  { href: "/dashboard/restock",    label: "Restock Queue",icon: RefreshCw },
  { href: "/dashboard/activity",   label: "Activity Log", icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Package2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 leading-none">StockFlow</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Inventory System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
