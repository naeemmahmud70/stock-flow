import { formatCurrency, formatTime } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { OrderStatusBadge } from "../ui";
import { AnalyticsProps } from "./Analytics";

export default function RecentOrders({ stats }: AnalyticsProps) {
  return (
    <div className="sf-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Recent orders</h3>
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
  );
}
