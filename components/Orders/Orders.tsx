"use client";
import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import { useProductStore } from "@/store/useProductStore";
import {
  Modal,
  ConfirmDialog,
  OrderStatusBadge,
  Alert,
  EmptyState,
  Spinner,
  Pagination,
} from "@/components/ui";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Order } from "@/types";
import {
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  ChevronDown,
  X,
  PlusIcon,
} from "lucide-react";

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

interface OrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  stock: number;
}

function CreateOrderModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { createOrder } = useOrderStore();
  const { products, fetchProducts, fetchCategories } = useProductStore();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const addItem = () => {
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;
    if (product.status !== "active") {
      setError("This product is currently unavailable.");
      return;
    }
    if (lines.some((l) => l.productId === selectedProductId)) {
      setError("This product is already added to the order.");
      return;
    }
    if (qty > product.stock) {
      setError(`Only ${product.stock} item(s) available for "${product.name}"`);
      return;
    }
    setError(null);
    setLines((l) => [
      ...l,
      {
        productId: product._id,
        productName: product.name,
        quantity: qty,
        price: product.price,
        stock: product.stock,
      },
    ]);
    setSelectedProductId("");
    setQty(1);
  };

  const removeItem = (id: string) =>
    setLines((l) => l.filter((x) => x.productId !== id));
  const updateQty = (id: string, newQty: number) => {
    const line = lines.find((l) => l.productId === id);
    if (!line) return;
    if (newQty > line.stock) {
      setError(`Only ${line.stock} available for "${line.productName}"`);
      return;
    }
    setError(null);
    setLines((l) =>
      l.map((x) => (x.productId === id ? { ...x, quantity: newQty } : x)),
    );
  };

  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (lines.length === 0) {
      setError("Add at least one product.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createOrder({
      customerName,
      customerEmail: customerEmail || undefined,
      items: lines.map((l) => ({ product: l.productId, quantity: l.quantity })),
      notes: notes || undefined,
    });
    setLoading(false);
    if (result.success) onSuccess();
    else setError(result.error ?? "Failed to create order");
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sf-label">Customer name *</label>
          <input
            className="sf-input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="John Smith"
          />
        </div>
        <div>
          <label className="sf-label">Customer email</label>
          <input
            className="sf-input"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="john@email.com"
          />
        </div>
      </div>

      {/* Add product line */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Add products
        </p>
        <div className="flex gap-2">
          <select
            className="sf-input text-xs flex-1"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {formatCurrency(p.price)} (
                {p.stock < 1 ? "out of stock" : `${p.stock} in stock`})
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value))}
            className="sf-input text-xs w-20"
            placeholder="Qty"
          />
          <button
            onClick={addItem}
            disabled={!selectedProductId}
            className="sf-btn-primary text-xs px-3"
          >
            Add
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line items */}
        {lines.length > 0 && (
          <div className="space-y-2 mt-2">
            {lines.map((line) => (
              <div
                key={line.productId}
                className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200"
              >
                <span className="flex-1 text-xs font-medium text-slate-700">
                  {line.productName}
                </span>
                <span className="text-xs text-slate-500">
                  {formatCurrency(line.price)} ×
                </span>
                <input
                  type="number"
                  min={1}
                  max={line.stock}
                  value={line.quantity}
                  onChange={(e) =>
                    updateQty(line.productId, parseInt(e.target.value))
                  }
                  className="w-14 px-2 py-1 text-xs border border-slate-200 rounded-md text-center"
                />
                <span className="text-xs font-semibold text-slate-800 w-16 text-right">
                  {formatCurrency(line.price * line.quantity)}
                </span>
                <button
                  onClick={() => removeItem(line.productId)}
                  className="text-slate-300 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-xs font-medium text-slate-500">Total</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="sf-label">Notes</label>
        <textarea
          className="sf-input resize-none"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional order notes"
        />
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onClose} className="sf-btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="sf-btn-primary"
        >
          {loading ? <Spinner size="sm" /> : null} Place order
        </button>
      </div>
    </div>
  );
}

export default function Orders() {
  const {
    orders,
    total,
    pages,
    page,
    isLoading,
    filters,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    setFilters,
    setPage,
  } = useOrderStore();
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{
    order: Order;
    status: string;
  } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  const handleStatusChange = async () => {
    if (!statusUpdate) return;
    await updateOrderStatus(statusUpdate.order._id, statusUpdate.status);
    setStatusUpdate(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Orders</h2>
          <p className="text-xs text-slate-400">{total} total orders</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="sf-btn-primary">
          <Plus className="w-4 h-4" /> New order
        </button>
      </div>

      {/* Filters */}
      <div className="sf-card p-3 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            className="sf-input pl-8 py-1.5 text-xs"
            placeholder="Search by customer…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
        <select
          className="sf-input py-1.5 text-xs w-auto min-w-[130px]"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(
            (s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ),
          )}
        </select>
        <input
          type="date"
          className="sf-input py-1.5 text-xs w-auto"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ dateFrom: e.target.value })}
        />
        <input
          type="date"
          className="sf-input py-1.5 text-xs w-auto"
          value={filters.dateTo}
          onChange={(e) => setFilters({ dateTo: e.target.value })}
        />
      </div>

      {/* Table */}
      <div className="sf-card ">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="w-6 h-6" />}
            title="No orders found"
            description="Create your first order to get started."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="sf-btn-primary text-xs"
              >
                New order
              </button>
            }
          />
        ) : (
          <div className="">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="text-xs font-mono font-medium text-blue-600">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs font-medium text-slate-800">
                        {order.customerName}
                      </p>
                      {order.customerEmail && (
                        <p className="text-[10px] text-slate-400">
                          {order.customerEmail}
                        </p>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-800">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <OrderStatusBadge status={order.status} />
                        {STATUS_FLOW[order.status]?.length > 0 && (
                          <div className="relative group">
                            <button className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-slate-500">
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <div className="absolute left-0 top-5 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-1 hidden group-hover:block min-w-[120px]">
                              {STATUS_FLOW[order.status].map((s) => (
                                <button
                                  key={s}
                                  onClick={() =>
                                    setStatusUpdate({ order, status: s })
                                  }
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md capitalize"
                                >
                                  → {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <p className="text-xs text-slate-600">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatTime(order.createdAt)}
                      </p>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        {["delivered", "cancelled"].includes(order.status) && (
                          <button
                            onClick={() => setDeleting(order)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3">
              <Pagination
                page={page}
                pages={pages}
                total={total}
                onPage={(p) => {
                  setPage(p);
                  fetchOrders();
                }}
              />
            </div>
          </div>
        )}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New order"
        width="max-w-2xl"
      >
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            fetchOrders();
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!statusUpdate}
        onClose={() => setStatusUpdate(null)}
        onConfirm={handleStatusChange}
        title="Update order status"
        message={`Change order ${statusUpdate?.order.orderNumber} to "${statusUpdate?.status}"?`}
        confirmLabel="Update status"
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await deleteOrder(deleting!._id);
          setDeleting(null);
        }}
        title="Delete order"
        message={`Delete order ${deleting?.orderNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
