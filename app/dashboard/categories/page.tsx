"use client";
import { useEffect, useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { Modal, ConfirmDialog, EmptyState, Alert, Spinner } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const { categories, fetchCategories, createCategory, isLoading } = useProductStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<{ _id: string; name: string; description?: string } | null>(null);
  const [deleting, setDeleting] = useState<{ _id: string; name: string } | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => { setForm({ name: "", description: "" }); setFormError(null); };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setFormLoading(true);
    const ok = await createCategory({ name: form.name, description: form.description });
    setFormLoading(false);
    if (ok) { setShowAdd(false); resetForm(); }
    else setFormError("Failed to create category. Name may already exist.");
  };

  const handleUpdate = async () => {
    if (!editing || !form.name.trim()) return;
    setFormLoading(true);
    const res = await fetch(`/api/categories/${editing._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, description: form.description }),
    });
    const data = await res.json();
    setFormLoading(false);
    if (data.success) { setEditing(null); resetForm(); fetchCategories(); }
    else setFormError(data.error);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await fetch(`/api/categories/${deleting._id}`, { method: "DELETE" });
    fetchCategories();
    setDeleting(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Categories</h2>
          <p className="text-xs text-slate-400">{categories.length} total categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="sf-btn-primary">
          <Plus className="w-4 h-4" /> Add category
        </button>
      </div>

      <div className="sf-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : categories.length === 0 ? (
          <EmptyState icon={<Tag className="w-6 h-6" />} title="No categories yet"
            description="Create categories to organise your products."
            action={<button onClick={() => setShowAdd(true)} className="sf-btn-primary text-xs">Add category</button>} />
        ) : (
          <table className="sf-table">
            <thead>
              <tr><th>Name</th><th>Description</th><th>Created</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="text-xs font-medium text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td><span className="text-xs text-slate-500">{c.description || "—"}</span></td>
                  <td><span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span></td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description ?? "" }); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleting(c)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); resetForm(); }} title="Add category">
        {formError && <Alert type="error" message={formError} className="mb-3" />}
        <div className="space-y-4">
          <div>
            <label className="sf-label">Name *</label>
            <input className="sf-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" />
          </div>
          <div>
            <label className="sf-label">Description</label>
            <input className="sf-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setShowAdd(false); resetForm(); }} className="sf-btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={formLoading || !form.name.trim()} className="sf-btn-primary">
              {formLoading ? <Spinner size="sm" /> : null} Create
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => { setEditing(null); resetForm(); }} title="Edit category">
        {formError && <Alert type="error" message={formError} className="mb-3" />}
        <div className="space-y-4">
          <div>
            <label className="sf-label">Name *</label>
            <input className="sf-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="sf-label">Description</label>
            <input className="sf-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setEditing(null); resetForm(); }} className="sf-btn-secondary">Cancel</button>
            <button onClick={handleUpdate} disabled={formLoading || !form.name.trim()} className="sf-btn-primary">
              {formLoading ? <Spinner size="sm" /> : null} Save changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Delete category" message={`Delete "${deleting?.name}"? This may affect products in this category.`}
        confirmLabel="Delete" danger />
    </div>
  );
}
