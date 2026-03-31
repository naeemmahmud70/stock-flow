"use client";
import { useEffect, useState, useCallback } from "react";
import { Spinner, EmptyState, Pagination } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/utils";
import { ActivityLog } from "@/types";
import { Activity, Package, ShoppingCart, RefreshCw, Tag, User } from "lucide-react";

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  Order: <ShoppingCart className="w-3.5 h-3.5" />,
  Product: <Package className="w-3.5 h-3.5" />,
  Category: <Tag className="w-3.5 h-3.5" />,
  User: <User className="w-3.5 h-3.5" />,
};

const ENTITY_COLORS: Record<string, string> = {
  Order: "bg-blue-50 text-blue-600",
  Product: "bg-emerald-50 text-emerald-600",
  Category: "bg-violet-50 text-violet-600",
  User: "bg-slate-100 text-slate-600",
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Group logs by date
  const grouped: Record<string, ActivityLog[]> = {};
  for (const log of logs) {
    const dateKey = formatDate(log.createdAt);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(log);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Activity Log</h2>
          <p className="text-xs text-slate-400">{total} total events</p>
        </div>
        <button onClick={fetchLogs} className="sf-btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={<Activity className="w-6 h-6" />}
            title="No activity yet"
            description="System events will appear here as you use StockFlow."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateLogs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{date}</span>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] text-slate-400">{dateLogs.length} event{dateLogs.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="sf-card overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {dateLogs.map((log, i) => (
                    <div key={log._id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center mt-0.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${ENTITY_COLORS[log.entity] ?? "bg-slate-100 text-slate-500"}`}>
                          {ENTITY_ICONS[log.entity] ?? <Activity className="w-3.5 h-3.5" />}
                        </div>
                        {i < dateLogs.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1 min-h-[16px]" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-xs font-medium text-slate-800">{log.action}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">by {log.userName}</span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">{formatTime(log.createdAt)}</span>
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {Object.entries(log.metadata).map(([k, v]) => (
                              <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-500">
                                <span className="text-slate-400">{k}:</span>
                                <span className="font-medium text-slate-600">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-300 shrink-0 mt-0.5">{formatTime(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="sf-card px-5 py-3">
            <Pagination page={page} pages={pages} total={total} onPage={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
