import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import React from "react";
import { AnalyticsProps } from "./Analytics";

export default function StockSummary({ stats }: AnalyticsProps) {
  return (
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
  );
}
