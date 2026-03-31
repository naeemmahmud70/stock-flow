import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStockPriorityLabel(stock: number, threshold: number): string {
  if (stock === 0) return "Critical";
  if (stock <= threshold * 0.5) return "High";
  if (stock <= threshold) return "Medium";
  return "Low";
}

export function getStockPriorityColor(priority: string): string {
  switch (priority) {
    case "high": return "text-red-600 bg-red-50 border-red-200";
    case "medium": return "text-amber-600 bg-amber-50 border-amber-200";
    case "low": return "text-blue-600 bg-blue-50 border-blue-200";
    default: return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case "pending": return "text-amber-700 bg-amber-50 border-amber-200";
    case "confirmed": return "text-blue-700 bg-blue-50 border-blue-200";
    case "shipped": return "text-violet-700 bg-violet-50 border-violet-200";
    case "delivered": return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "cancelled": return "text-red-700 bg-red-50 border-red-200";
    default: return "text-slate-600 bg-slate-50 border-slate-200";
  }
}
