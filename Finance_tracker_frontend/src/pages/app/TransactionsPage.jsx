import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit3, Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Field from "../../components/ui/Field.jsx";
import Input from "../../components/ui/Input.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useTransactionStore } from "../../stores/transactionStore.js";
import { useCategoryStore } from "../../stores/categoryStore.js";
import { useToast } from "../../components/ui/ToastHost.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

export default function TransactionsPage() {
  const toast = useToast();

  const items = useTransactionStore((s) => s.transactions);
  const total = useTransactionStore((s) => s.total);
  const summary = useTransactionStore((s) => s.summary);
  const loading = useTransactionStore((s) => s.loading);
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const fetchSummary = useTransactionStore((s) => s.fetchTransactionSummary);
  const createTransactionAction = useTransactionStore((s) => s.createTransaction);
  const updateTransactionAction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransactionAction = useTransactionStore((s) => s.deleteTransaction);

  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  // Create/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ categoryId: "", amount: "", type: "expense", date: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);

  // Quick Add Category
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("🏷️");
  const [catColor, setCatColor] = useState("#4F46E5");
  const [catBusy, setCatBusy] = useState(false);

  const limit = 10;

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("limit", String(limit));
    if (type) q.set("type", type);
    if (search.trim()) q.set("search", search.trim());
    return q.toString();
  }, [page, type, search]);

  useEffect(() => {
    fetchTransactions(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    fetchSummary();
    if (categories.length === 0) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onQuickCat = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatBusy(true);
    try {
      const res = await useCategoryStore.getState().createCategory({
        name: catName.trim(),
        icon: catIcon,
        color: catColor
      });
      toast.success("Category added!");
      setFormData({ ...formData, categoryId: res.id });
      setCatName("");
      setShowCatForm(false);
    } catch (err) {
      toast.error(err.message || "Failed to add category");
    } finally {
      setCatBusy(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        amount: Number(formData.amount),
      };

      if (editId) {
        await updateTransactionAction(editId, payload);
        toast.success("Transaction updated");
      } else {
        await createTransactionAction(payload);
        toast.success("Transaction created");
      }

      setFormData({ categoryId: "", amount: "", type: "expense", date: "", description: "" });
      setShowForm(false);
      setEditId(null);
      await fetchTransactions(query);
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (t) => {
    setEditId(t.id);
    setFormData({
      categoryId: t.categoryId || "",
      amount: t.amount,
      type: t.type,
      date: t.date ? new Date(t.date).toISOString().split("T")[0] : "",
      description: t.description || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransactionAction(deleteId);
      toast.success("Transaction deleted");
      setDeleteId(null);
      await fetchTransactions(query);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              <TrendingUp size={14} />
              Total Income
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-700">
              +{Number(summary.totalIncome || 0).toLocaleString("en-ET")} ETB
            </div>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-rose-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              <TrendingDown size={14} />
              Total Expenses
            </div>
            <div className="mt-1 text-xl font-bold text-rose-700">
              -{Number(summary.totalExpense || 0).toLocaleString("en-ET")} ETB
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Type" className="flex-1 min-w-[120px]">
            <select
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </Field>
          <Field label="Search" className="flex-[2] min-w-[180px]">
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={Search}
              placeholder="Description..."
            />
          </Field>
          <Button
            variant={showForm ? "ghost" : "primary"}
            icon={Plus}
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditId(null);
                setFormData({ categoryId: "", amount: "", type: "expense", date: "", description: "" });
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Cancel" : "Add"}
          </Button>
        </div>
      </Card>

      {/* Create/Edit form */}
      {showForm && (
        <Card title={editId ? "Edit Transaction" : "New Transaction"} className="animate-slide-up">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Field label="Category">
                  <div className="flex gap-2">
                    <select
                      className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCatForm(!showCatForm)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--muted))] transition-all hover:bg-[rgb(var(--primary))]/5 hover:text-[rgb(var(--primary))] hover:border-[rgb(var(--primary))]/30 cursor-pointer"
                      title="Quick Add Category"
                    >
                      <Plus size={18} className={showCatForm ? "rotate-45" : ""} aria-hidden="true" />
                    </button>
                  </div>
                </Field>

                {showCatForm && (
                  <div className="rounded-2xl border border-[rgb(var(--primary))]/20 bg-[rgb(var(--primary))]/5 p-4 space-y-3 animate-slide-up">
                    <div className="text-xs font-bold text-[rgb(var(--primary))] uppercase tracking-wider">Quick Add Category</div>
                    <div className="flex gap-2">
                      <Input
                        className="w-12 h-10 p-0 text-center"
                        value={catIcon}
                        onChange={(e) => setCatIcon(e.target.value)}
                        placeholder="Icon"
                      />
                      <Input
                        className="flex-1 h-10"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="Category name..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={catColor}
                        onChange={(e) => setCatColor(e.target.value)}
                        className="h-8 w-14 rounded cursor-pointer border-none bg-transparent"
                      />
                      <Button
                        type="button"
                        onClick={onQuickCat}
                        loading={catBusy}
                        size="sm"
                        className="flex-1"
                      >
                        Add Category
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Field label="Amount (ETB)">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type">
                <select
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </Field>
              <Field label="Date">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </Field>
            </div>
            <Field label="Description">
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Lunch at Romina, Ride to Bole..."
              />
            </Field>
            <div className="flex gap-2">
              <Button loading={submitting} className="flex-1">
                {editId ? "Save Changes" : "Create Transaction"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      <Card title={`Transactions (${total})`}>
        {loading ? (
          <div className="py-12 text-center"><Spinner /></div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-sm text-[rgb(var(--muted))] mb-4">No transactions found matching filters.</div>
            {(type || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setType(""); setSearch(""); setPage(1); }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((t) => (
              <div
                key={t.id}
                className="group flex items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3.5 transition-all hover:border-[rgb(var(--primary))]/30 hover:bg-[rgb(var(--card))]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--border))] text-base">
                      {t.Category?.icon || "🏷️"}
                    </span>
                    <span className="truncate">{t.Category?.name || "Uncategorized"}</span>
                    <span className="text-[10px] text-[rgb(var(--muted))] font-medium border border-[rgb(var(--border))] rounded-md px-1.5 py-0.5 uppercase tracking-tighter">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {t.description && (
                    <div className="mt-1 text-xs text-[rgb(var(--muted))] truncate pl-10 underline decoration-[rgb(var(--border))] underline-offset-4">
                      {t.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className={`text-base font-black whitespace-nowrap mr-2 ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.type === "income" ? "+" : "-"}{Number(t.amount).toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB
                  </span>
                  <button
                    onClick={() => onEdit(t)}
                    className="rounded-lg p-2 text-[rgb(var(--muted))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/10 transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 size={16} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="rounded-lg p-2 text-[rgb(var(--muted))] hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[rgb(var(--border))]">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[rgb(var(--fg))]">{page}</span>
              <span className="text-[10px] text-[rgb(var(--muted))]">/ {totalPages}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete transaction?"
        description="This action cannot be undone and will permanently remove this record from your history."
        confirmText="Permanently Delete"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </div>
  );
}
