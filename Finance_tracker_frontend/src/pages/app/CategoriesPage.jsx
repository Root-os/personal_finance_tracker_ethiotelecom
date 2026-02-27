import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Tag, Check, X } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Field from "../../components/ui/Field.jsx";
import Input from "../../components/ui/Input.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useCategoryStore } from "../../stores/categoryStore.js";
import { useToast } from "../../components/ui/ToastHost.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

export default function CategoriesPage() {
  const toast = useToast();
  const items = useCategoryStore((s) => s.categories);
  const loading = useCategoryStore((s) => s.loading);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const createCategory = useCategoryStore((s) => s.createCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategoryAction = useCategoryStore((s) => s.deleteCategory);
  const getStatForCategory = useCategoryStore((s) => s.getStatForCategory);

  // Create form
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [icon, setIcon] = useState("💳");
  const [submitting, setSubmitting] = useState(false);

  // Edit
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");

  // Delete
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createCategory({ name: name.trim(), color, icon });
      toast.success("Category created");
      setName("");
    } catch (err) {
      toast.error(err.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || "#4F46E5");
    setEditIcon(cat.icon || "🏷️");
  };

  const saveEdit = async () => {
    try {
      await updateCategory(editId, { name: editName, color: editColor, icon: editIcon });
      toast.success("Category updated");
      setEditId(null);
    } catch (err) {
      toast.error(err.message || "Failed to update");
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategoryAction(deleteId);
      toast.success("Category deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create */}
      <Card title="New Category">
        <form className="space-y-3" onSubmit={create}>
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mercato Shopping, Lunch"
              icon={Tag}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Color">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 p-1 cursor-pointer"
              />
            </Field>
            <Field label="Icon">
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🏷️" />
            </Field>
            <div className="flex items-end">
              <Button loading={submitting} disabled={!name.trim()} className="w-full" icon={Plus}>
                Add
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* List */}
      <Card title={`Categories (${items.length})`}>
        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-[rgb(var(--muted))]">
            No categories yet. Create your first one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((c) => {
              const stat = getStatForCategory(c.id);
              const isEditing = editId === c.id;

              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3 transition-colors hover:bg-[rgb(var(--card))]"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="w-12 text-center"
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="h-9 w-9 p-0.5 cursor-pointer"
                      />
                      <button onClick={saveEdit} className="rounded-lg p-1.5 text-[rgb(var(--success))] hover:bg-[rgb(var(--success))]/10 cursor-pointer">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditId(null)} className="rounded-lg p-1.5 text-[rgb(var(--muted))] hover:bg-[rgb(var(--danger))]/10 cursor-pointer">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-base"
                          style={{ background: c.color || "#4F46E5" }}
                        >
                          {c.icon || "🏷️"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{c.name}</div>
                          {stat && (
                            <div className="text-xs text-[rgb(var(--muted))]">
                              {stat.transactionCount || 0} txns · {Number(stat.totalAmount || 0).toLocaleString("en-ET")} ETB
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="rounded-lg p-1.5 text-[rgb(var(--muted))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 transition-colors cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="rounded-lg p-1.5 text-[rgb(var(--muted))] hover:text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger))]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete category?"
        description="All transactions linked to this category will be affected. This action cannot be undone."
        confirmText="Delete"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </div>
  );
}
