import React from "react";
import { StatCard } from "../ui";
import { AlertTriangle, Clock, ShoppingCart, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardStats } from "@/types";

export interface AnalyticsProps {
  stats: DashboardStats;
}

export default function Analytics({ stats }: AnalyticsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Orders today"
        value={stats.totalOrdersToday}
        icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
        iconBg="bg-blue-50"
      />
      <StatCard
        label="Revenue today"
        value={formatCurrency(stats.revenueToday)}
        icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        iconBg="bg-emerald-50"
      />
      <StatCard
        label="Pending orders"
        value={stats.pendingOrders}
        icon={<Clock className="w-5 h-5 text-amber-600" />}
        iconBg="bg-amber-50"
      />
      <StatCard
        label="Low stock alerts"
        value={stats.lowStockCount}
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        iconBg="bg-red-50"
        sub={stats.lowStockCount > 0 ? "Needs restocking" : "All good"}
      />
    </div>
  );
}
