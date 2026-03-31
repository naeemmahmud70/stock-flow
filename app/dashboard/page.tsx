"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { StatCard, Spinner, OrderStatusBadge } from "@/components/ui";
import { formatCurrency, formatTime } from "@/lib/utils";
import { DashboardStats } from "@/types";
import {
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getUserToken } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const { logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getUserToken();
    console.log("token", token);

    const checkUser = async () => {
      if (!token) {
        await logout();
      }
    };
    checkUser();
  }, []);

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
      {/* Stat cards */}
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 sf-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Revenue — last 7 days
              </h3>
              <p className="text-xs text-slate-400">
                Daily revenue from non-cancelled orders
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={stats.revenueByDay}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(v: number) => [formatCurrency(v), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status chart */}
        <div className="sf-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            Orders by status
          </h3>
          <p className="text-xs text-slate-400 mb-4">All-time breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={stats.ordersByStatus}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="_id"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="sf-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">
              Recent orders
            </h3>
            <Link
              href="/dashboard/orders"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 p-5">No orders yet.</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      {order.orderNumber}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {order.customerName} · {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatCurrency(order.totalPrice)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product summary */}
        <div className="sf-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">
              Product stock summary
            </h3>
            <Link
              href="/dashboard/products"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.productSummary.length === 0 ? (
              <p className="text-xs text-slate-400 p-5">No products yet.</p>
            ) : (
              stats.productSummary.map((p) => {
                const low = p.stock <= p.minStockThreshold;
                const pct = Math.min(
                  100,
                  Math.round(
                    (p.stock / Math.max(p.minStockThreshold * 3, 1)) * 100,
                  ),
                );
                return (
                  <div key={p._id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Package
                          className={`w-3.5 h-3.5 ${low ? "text-amber-500" : "text-emerald-500"}`}
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {p.name}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-medium ${low ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {p.stock} left {low && "⚠️"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${p.stock === 0 ? "bg-red-400" : low ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
