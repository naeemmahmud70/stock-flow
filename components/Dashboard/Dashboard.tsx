"use client";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui";
import { DashboardStats } from "@/types";
import RevenueCharts from "./RevenueCharts";
import Analytics from "./Analytics";
import RecentOrders from "./RecentOrders";
import StockSummary from "./StockSummary";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats)
    return <p className="text-slate-500">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Analytics stats={stats} />
      <RevenueCharts stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrders stats={stats} />
        <StockSummary stats={stats} />
      </div>
    </div>
  );
}
