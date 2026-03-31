"use client";
import { useEffect, useState } from "react";
import { useRestockStore } from "@/store/useRestockStore";
import {
  Modal,
  PriorityBadge,
  Alert,
  EmptyState,
  Spinner,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { RestockItem, Product } from "@/types";
import { RefreshCw, PackagePlus, CheckCircle } from "lucide-react";

function RestockModal({
  item,
  onClose,
  onSuccess,
}: {
  item: RestockItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { restockProduct } = useRestockStore();
  const [addStock, setAddStock] = useState(item.threshold * 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const product = item.product as Product;

  const handleRestock = async () => {
    if (addStock < 1) {
      setError("Enter a valid quantity");
      return;
    }
    setLoading(true);
    const result = await restockProduct(product._id, addStock);
    setLoading(false);
    if (result.success) onSuccess();
    else setError(result.error ?? "Failed to restock");
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Current stock</span>
          <span className="font-semibold text-red-600">
            {item.currentStock} units
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Minimum threshold</span>
          <span className="font-medium text-slate-700">
            {item.threshold} units
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Suggested restock</span>
          <span className="font-medium text-blue-600">
            {item.threshold * 2} units
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
          <div
            className="bg-red-400 h-1.5 rounded-full"
            style={{
              width: `${Math.min(100, (item.currentStock / item.threshold) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div>
        <label className="sf-label">Units to add *</label>
        <input
          type="number"
          min={1}
          value={addStock}
          onChange={(e) => setAddStock(parseInt(e.target.value))}
          className="sf-input"
        />
        <p className="text-xs text-slate-400 mt-1">
          New stock will be: {item.currentStock + addStock || 0} units
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onClose} className="sf-btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleRestock}
          disabled={loading}
          className="sf-btn-primary"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <PackagePlus className="w-4 h-4" />
          )}
          Restock
        </button>
      </div>
    </div>
  );
}

export default function Restock() {
  const { items, isLoading, fetchQueue } = useRestockStore();
  const [restocking, setRestocking] = useState<RestockItem | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSuccess = (productName: string) => {
    setRestocking(null);
    setSuccessMsg(`"${productName}" has been restocked successfully!`);
    fetchQueue();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...items].sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      a.currentStock - b.currentStock,
  );

  const high = sorted.filter((i) => i.priority === "high");
  const medium = sorted.filter((i) => i.priority === "medium");
  const low = sorted.filter((i) => i.priority === "low");

  const ItemRow = ({ item }: { item: RestockItem }) => {
    const product = item.product as Product;
    const pct = Math.min(
      100,
      Math.round((item.currentStock / item.threshold) * 100),
    );
    return (
      <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold text-slate-800">
              {product?.name}
            </p>
            <PriorityBadge priority={item.priority} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  item.priority === "high"
                    ? "bg-red-400"
                    : item.priority === "medium"
                      ? "bg-amber-400"
                      : "bg-blue-400",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 shrink-0">
              {item.currentStock} / {item.threshold}
            </span>
          </div>
        </div>
        <button
          onClick={() => setRestocking(item)}
          className="sf-btn-secondary text-xs px-3 py-1.5 shrink-0"
        >
          <PackagePlus className="w-3.5 h-3.5" /> Restock
        </button>
      </div>
    );
  };

  const Section = ({
    title,
    items,
    color,
  }: {
    title: string;
    items: RestockItem[];
    color: string;
  }) => {
    if (items.length === 0) return null;
    return (
      <div className="sf-card overflow-hidden">
        <div
          className={cn(
            "px-5 py-3 border-b border-slate-100 flex items-center gap-2",
            color,
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-wide">
            {title}
          </span>
          <span className="ml-auto text-xs font-medium bg-white/60 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        {items.map((item) => (
          <ItemRow key={item._id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Restock Queue
          </h2>
          <p className="text-xs text-slate-400">
            {items.length} product{items.length !== 1 ? "s" : ""} need
            restocking
          </p>
        </div>
        <button onClick={fetchQueue} className="sf-btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
            title="All products well stocked"
            description="No products are currently below their minimum stock threshold."
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Section
            title="🔴 High priority"
            items={high}
            color="text-red-600 bg-red-50"
          />
          <Section
            title="🟡 Medium priority"
            items={medium}
            color="text-amber-600 bg-amber-50"
          />
          <Section
            title="🔵 Low priority"
            items={low}
            color="text-blue-600 bg-blue-50"
          />
        </div>
      )}

      <Modal
        open={!!restocking}
        onClose={() => setRestocking(null)}
        title={`Restock — ${(restocking?.product as Product)?.name}`}
      >
        {restocking && (
          <RestockModal
            item={restocking}
            onClose={() => setRestocking(null)}
            onSuccess={() =>
              handleSuccess((restocking.product as Product)?.name)
            }
          />
        )}
      </Modal>
    </div>
  );
}
