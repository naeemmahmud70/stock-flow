"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; className?: string; }
export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn("sf-badge", className)}>{children}</span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:   "text-amber-700 bg-amber-50 border-amber-200",
    confirmed: "text-blue-700 bg-blue-50 border-blue-200",
    shipped:   "text-violet-700 bg-violet-50 border-violet-200",
    delivered: "text-emerald-700 bg-emerald-50 border-emerald-200",
    cancelled: "text-red-600 bg-red-50 border-red-200",
  };
  return <Badge className={styles[status] ?? "text-slate-600 bg-slate-50 border-slate-200"}>{status}</Badge>;
}

export function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0) return <Badge className="text-red-700 bg-red-50 border-red-200">Out of stock</Badge>;
  if (stock <= threshold) return <Badge className="text-amber-700 bg-amber-50 border-amber-200">Low stock</Badge>;
  return <Badge className="text-emerald-700 bg-emerald-50 border-emerald-200">In stock</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high:   "text-red-700 bg-red-50 border-red-200",
    medium: "text-amber-700 bg-amber-50 border-amber-200",
    low:    "text-blue-700 bg-blue-50 border-blue-200",
  };
  return <Badge className={styles[priority] ?? "text-slate-600 bg-slate-50 border-slate-200"}>{priority}</Badge>;
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}
export function Modal({ open, onClose, title, children, width = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl w-full animate-slide-up", width)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  sub?: string;
  trend?: { value: string; up: boolean };
}
export function StatCard({ label, value, icon, iconBg = "bg-blue-50", sub, trend }: StatCardProps) {
  return (
    <div className="sf-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          {trend && (
            <p className={cn("text-xs font-medium mt-1", trend.up ? "text-emerald-600" : "text-red-500")}>
              {trend.up ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">{icon}</div>
      <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }[size];
  return (
    <div className={cn("animate-spin rounded-full border-2 border-slate-200 border-t-blue-600", s)} />
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="sf-btn-secondary">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={danger ? "sf-btn-danger" : "sf-btn-primary"}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
interface AlertProps { type: "error" | "warning" | "success" | "info"; message: string; onClose?: () => void; }
export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    error:   "bg-red-50 border-red-200 text-red-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info:    "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <div className={cn("flex items-center gap-2 p-3 border rounded-lg text-sm", styles[type])}>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps { page: number; pages: number; total: number; onPage: (p: number) => void; }
export function Pagination({ page, pages, total, onPage }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">{total} total results</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1} className="sf-btn-secondary px-2 py-1 text-xs disabled:opacity-40">← Prev</button>
        <span className="px-3 py-1 text-xs text-slate-600">{page} / {pages}</span>
        <button onClick={() => onPage(page + 1)} disabled={page === pages} className="sf-btn-secondary px-2 py-1 text-xs disabled:opacity-40">Next →</button>
      </div>
    </div>
  );
}
