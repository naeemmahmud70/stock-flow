"use client";
import { useEffect, useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { Modal, ConfirmDialog, OrderStatusBadge, StockBadge, Alert, EmptyState, Spinner, Pagination } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import { Product, Category } from "@/types";
import { Plus, Search, Pencil, Trash2, Package, Filter } from "lucide-react";

function ProductForm({
  initial, categories, onSubmit, onClose, loading, error,
}: {
  initial?: Partial<Product>;
  categories: Category[];
  onSubmit: (d: Partial<Product>) => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: typeof initial?.category === "object" ? (initial.category as Category)._id : (initial?.category ?? ""),
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    minStockThreshold: initial?.minStockThreshold ?? 5,
    status: initial?.status ?? "active",
    sku: initial?.sku ?? "",
    description: initial?.description ?? "",
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} />}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="sf-label">Product name *</label>
          <input className="sf-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. iPhone 15 Pro" required />
        </div>
        <div>
          <label className="sf-label">Category *</label>
          <select className="sf-input" value={form.category} onChange={(e) => set("category", e.target.value)} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="sf-label">Price ($) *</label>
          <input className="sf-input" type="number" min={0} step={0.01} value={form.price} onChange={(e) => set("price", parseFloat(e.target.value))} required />
        </div>
        <div>
          <label className="sf-label">Stock quantity *</label>
          <input className="sf-input" type="number" min={0} value={form.stock} onChange={(e) => set("stock", parseInt(e.target.value))} required />
        </div>
        <div>
          <label className="sf-label">Min. threshold *</label>
          <input className="sf-input" type="number" min={0} value={form.minStockThreshold} onChange={(e) => set("minStockThreshold", parseInt(e.target.value))} required />
        </div>
        <div>
          <label className="sf-label">SKU</label>
          <input className="sf-input" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKU-001" />
        </div>
        <div>
          <label className="sf-label">Status</label>
          <select className="sf-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="sf-label">Description</label>
          <textarea className="sf-input resize-none" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description" />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onClose} className="sf-btn-secondary">Cancel</button>
        <button onClick={() => onSubmit(form)} disabled={loading || !form.name || !form.category} className="sf-btn-primary">
          {loading ? <Spinner size="sm" /> : null}
          {initial?._id ? "Save changes" : "Add product"}
        </button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, categories, total, pages, page, isLoading, error, filters,
    fetchProducts, fetchCategories, createProduct, updateProduct, deleteProduct, setFilters, setPage } = useProductStore();

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [page, filters]);

  const handleCreate = async (data: Partial<Product>) => {
    setFormLoading(true); setFormError(null);
    const ok = await createProduct(data);
    setFormLoading(false);
    if (ok) setShowAdd(false);
    else setFormError(error);
  };

  const handleUpdate = async (data: Partial<Product>) => {
    if (!editing) return;
    setFormLoading(true); setFormError(null);
    const ok = await updateProduct(editing._id, data);
    setFormLoading(false);
    if (ok) setEditing(null);
    else setFormError(error);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteProduct(deleting._id);
    setDeleting(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Products</h2>
          <p className="text-xs text-slate-400">{total} total products</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="sf-btn-primary">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {/* Filters */}
      <div className="sf-card p-3 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input className="sf-input pl-8 py-1.5 text-xs" placeholder="Search products…" value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })} />
        </div>
        <select className="sf-input py-1.5 text-xs w-auto min-w-[140px]" value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="sf-input py-1.5 text-xs w-auto min-w-[120px]" value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="sf-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48"><Spinner size="md" /></div>
        ) : products.length === 0 ? (
          <EmptyState icon={<Package className="w-6 h-6" />} title="No products found"
            description="Add your first product to get started."
            action={<button onClick={() => setShowAdd(true)} className="sf-btn-primary text-xs">Add product</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="sf-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Price</th>
                  <th>Stock</th><th>Status</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cat = p.category as Category;
                  return (
                    <tr key={p._id}>
                      <td>
                        <p className="font-medium text-slate-800 text-xs">{p.name}</p>
                        {p.sku && <p className="text-[10px] text-slate-400">{p.sku}</p>}
                      </td>
                      <td><span className="text-xs text-slate-600">{cat?.name ?? "—"}</span></td>
                      <td><span className="text-xs font-medium text-slate-800">{formatCurrency(p.price)}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-medium", p.stock <= p.minStockThreshold ? "text-amber-600" : "text-slate-700")}>
                            {p.stock}
                          </span>
                          <span className="text-[10px] text-slate-300">/ {p.minStockThreshold} min</span>
                        </div>
                      </td>
                      <td><StockBadge stock={p.stock} threshold={p.minStockThreshold} /></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(p)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleting(p)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3">
              <Pagination page={page} pages={pages} total={total} onPage={(p) => { setPage(p); fetchProducts(); }} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setFormError(null); }} title="Add new product" width="max-w-xl">
        <ProductForm categories={categories} onSubmit={handleCreate} onClose={() => setShowAdd(false)} loading={formLoading} error={formError} />
      </Modal>

      <Modal open={!!editing} onClose={() => { setEditing(null); setFormError(null); }} title="Edit product" width="max-w-xl">
        {editing && <ProductForm initial={editing} categories={categories} onSubmit={handleUpdate} onClose={() => setEditing(null)} loading={formLoading} error={formError} />}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Delete product" message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete" danger />
    </div>
  );
}
