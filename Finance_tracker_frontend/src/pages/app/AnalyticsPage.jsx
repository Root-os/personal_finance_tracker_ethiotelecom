import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Field from "../../components/ui/Field.jsx";
import Input from "../../components/ui/Input.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useAnalyticsStore } from "../../stores/analyticsStore.js";
import { useToast } from "../../components/ui/ToastHost.jsx";

export default function AnalyticsPage() {
  const toast = useToast();
  const loading = useAnalyticsStore((s) => s.loading);
  const summary = useAnalyticsStore((s) => s.summary);
  const trends = useAnalyticsStore((s) => s.trends);
  const categoryBreakdown = useAnalyticsStore((s) => s.categoryBreakdown);
  const topExpenses = useAnalyticsStore((s) => s.topExpenses);
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics);
  const runBudgetAction = useAnalyticsStore((s) => s.runBudget);

  const [period, setPeriod] = useState("month");
  const [budget, setBudget] = useState("200");
  const [budgetRes, setBudgetRes] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const runBudget = async () => {
    setBudgetLoading(true);
    try {
      const res = await runBudgetAction(budget);
      setBudgetRes(res);
    } catch (err) {
      toast.error(err.message || "Failed to calculate");
    } finally {
      setBudgetLoading(false);
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
      {/* Period Toggle */}
      <div className="flex gap-2">
        {["week", "month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer ${period === p
              ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-fg))] shadow-sm"
              : "bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary */}
      <Card title="Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Income"
            value={summary?.totalIncome}
            icon={TrendingUp}
            color="text-[rgb(var(--success))]"
            bg="bg-[rgb(var(--success))]/10"
            prefix="ETB "
          />
          <MetricCard
            label="Expenses"
            value={summary?.totalExpense}
            icon={TrendingDown}
            color="text-[rgb(var(--danger))]"
            bg="bg-[rgb(var(--danger))]/10"
            prefix="ETB "
          />
          <MetricCard
            label="Balance"
            value={summary?.balance}
            icon={DollarSign}
            color="text-[rgb(var(--primary))]"
            bg="bg-[rgb(var(--primary))]/10"
            prefix="ETB "
          />
          <MetricCard
            label="Savings Rate"
            value={summary?.savingsRate != null ? `${Math.round(summary.savingsRate)}%` : null}
            icon={BarChart3}
            color="text-[rgb(var(--accent))]"
            bg="bg-[rgb(var(--accent))]/10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trends */}
        {trends.length > 0 && (
          <Card title="Trends">
            <div className="space-y-2">
              {trends.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
                  <span className="text-sm text-[rgb(var(--muted))]">{t.period || t.date || t.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-[rgb(var(--success))]">+{Number(t.income || 0).toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB</span>
                    <span className="text-[rgb(var(--danger))]">-{Number(t.expense || 0).toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Card title="By Category">
            <div className="space-y-2">
              {categoryBreakdown.map((c, i) => {
                const maxAmount = Math.max(...categoryBreakdown.map((x) => Number(x.total || x.amount || 0)));
                const amount = Number(c.total || c.amount || 0);
                const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.categoryName || c.name || "Other"}</span>
                      <span className="text-[rgb(var(--muted))]">
                        {amount.toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB
                        {c.percentage != null && ` (${Math.round(c.percentage)}%)`}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[rgb(var(--primary))] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Top Expenses */}
      {topExpenses.length > 0 && (
        <Card title="Top Expenses">
          <div className="space-y-2">
            {topExpenses.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
                <div>
                  <div className="text-sm font-semibold">{t.description || t.Category?.name || "Expense"}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    {t.date ? new Date(t.date).toLocaleDateString() : ""}
                  </div>
                </div>
                <span className="text-sm font-bold text-[rgb(var(--danger))]">
                  -{Number(t.amount || 0).toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget Comparison */}
      <Card title="Budget Comparison">
        <div className="space-y-3">
          <div className="flex items-end gap-3">
            <Field label="Monthly Budget (ETB)" className="flex-1">
              <Input
                inputMode="decimal"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 5000"
              />
            </Field>
            <Button onClick={runBudget} loading={budgetLoading}>
              Calculate
            </Button>
          </div>

          {budgetRes && (
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4 space-y-3 animate-fade-in">
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--muted))]">Budget</span>
                <span className="font-medium">{Number(budgetRes.budget || budget).toLocaleString("en-ET")} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--muted))]">Spent</span>
                <span className="font-medium text-[rgb(var(--danger))]">{Number(budgetRes.spent || 0).toLocaleString("en-ET")} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgb(var(--muted))]">Remaining</span>
                <span className={`font-medium ${Number(budgetRes.remaining) >= 0 ? "text-[rgb(var(--success))]" : "text-[rgb(var(--danger))]"}`}>
                  {Number(budgetRes.remaining || 0).toLocaleString("en-ET")} ETB
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${Number(budgetRes.percentageUsed) > 100 ? "bg-[rgb(var(--danger))]" : "bg-[rgb(var(--success))]"
                    }`}
                  style={{ width: `${Math.min(Number(budgetRes.percentageUsed || 0), 100)}%` }}
                />
              </div>
              <div className="text-center text-sm font-medium">
                {Math.round(budgetRes.percentageUsed || 0)}% used
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, bg, prefix = "" }) {
  const display =
    value === undefined || value === null
      ? "—"
      : typeof value === "number"
        ? `${prefix}${Number(value).toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`
        : value;

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
          <Icon size={14} className={color} />
        </div>
        <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      </div>
      <div className={`text-xl lg:text-2xl font-black ${color}`}>{display}</div>
    </div>
  );
}
