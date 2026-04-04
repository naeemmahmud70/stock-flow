import { formatCurrency } from "@/lib/utils";
import React from "react";
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
import { AnalyticsProps } from "./Analytics";

export default function RevenueCharts({ stats }: AnalyticsProps) {
  return (
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
  );
}
