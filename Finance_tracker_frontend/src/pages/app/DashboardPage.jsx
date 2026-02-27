import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import { useAnalyticsStore } from "../../stores/analyticsStore.js";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const me = useAuthStore((s) => s.me);
  const fetchDashboard = useAnalyticsStore((s) => s.fetchDashboard);
  const stats = useAnalyticsStore((s) => s.summary);
  const quick = useAnalyticsStore((s) => s.quickStats);
  const loading = useAnalyticsStore((s) => s.loading);

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    console.log("DASHBOARD DATA:", stats);
    console.log("QUICK DATA:", quick);
  }, [stats, quick]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  function RecentTransactions({ transactions }) {
    if (!transactions?.length) {
      return (
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 text-center text-sm text-[rgb(var(--muted))]">
          No recent transactions
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
          <h2 className="font-semibold text-lg">Recent Transactions</h2>
          <span className="text-xs text-[rgb(var(--muted))]">
            Last {transactions.length}
          </span>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5 transition"
                >
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString()}
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 font-medium">{t.description}</td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {t.category?.icon && (
                        <span className="text-base">{t.category.icon}</span>
                      )}
                      <span>{t.category?.name ?? "—"}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.type === "income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {t.amount.toLocaleString("en-ET")} ETB
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer (optional) */}
        <div className="px-6 py-3 border-t border-[rgb(var(--border))] text-right">
          <button className="text-sm font-medium text-[rgb(var(--primary))] hover:underline">
            View all transactions →
          </button>
        </div>
      </div>
    );
  }

  function CategoryChartInline({ categoryTotals }) {
    const CHART_COLORS = [
      "#EC4899",
      "#3B82F6",
      "#48e552",
      "#F59E0B",
      "#8B5CF6",
    ];

    if (!categoryTotals?.length)
      return (
        <p className="text-sm text-[rgb(var(--muted))]">
          No category data to display
        </p>
      );

    return (
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
        <h2 className="font-bold text-lg mb-2">Expenses by Category</h2>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={categoryTotals}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={3}
            >
              {categoryTotals.map((_, index) => (
                <Cell
                  key={index}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value.toLocaleString("en-ET")} ETB`}
            />
            <Legend verticalAlign="bottom" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
          Welcome back{me?.name ? `, ${me.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="text-base lg:text-lg text-[rgb(var(--muted))]">
          Here&apos;s your financial overview.
        </p>
      </div>

      {/* Overview Metrics */}
      <Card title="Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Income"
            value={stats?.total?.income}
            icon={TrendingUp}
            color="text-[rgb(var(--success))]"
            bg="bg-[rgb(var(--success))]/10"
            prefix="+"
          />

          <MetricCard
            label="Total Expenses"
            value={stats?.total?.expense}
            icon={TrendingDown}
            color="text-[rgb(var(--danger))]"
            bg="bg-[rgb(var(--danger))]/10"
            prefix="-"
          />

          <MetricCard
            label="Balance"
            value={stats?.total?.balance}
            icon={Wallet}
            color="text-[rgb(var(--primary))]"
            bg="bg-[rgb(var(--primary))]/10"
          />

          <MetricCard
            label="Savings Rate"
            value={
              stats?.total
                ? `${Math.round(
                    (stats.total.balance / stats.total.income) * 100,
                  )}%`
                : null
            }
            icon={PiggyBank}
            color="text-[rgb(var(--accent))]"
            bg="bg-[rgb(var(--accent))]/10"
          />
        </div>
      </Card>

      {/* Quick Stats */}
      <Card title="This Month">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Income"
            value={quick?.monthly?.income}
            icon={TrendingUp}
            color="text-[rgb(var(--success))]"
            bg="bg-[rgb(var(--success))]/10"
            prefix="+"
          />

          <MetricCard
            label="Expenses"
            value={quick?.monthly?.expense}
            icon={TrendingDown}
            color="text-[rgb(var(--danger))]"
            bg="bg-[rgb(var(--danger))]/10"
            prefix="-"
          />

          <MetricCard
            label="Balance"
            value={quick?.monthly?.balance}
            icon={Wallet}
            color="text-[rgb(var(--primary))]"
            bg="bg-[rgb(var(--primary))]/10"
          />

          <MetricCard
            label="Savings Rate"
            value={
              quick?.monthly
                ? `${Math.round(
                    (quick.monthly.balance / quick.monthly.income) * 100,
                  )}%`
                : null
            }
            icon={PiggyBank}
            color="text-[rgb(var(--accent))]"
            bg="bg-[rgb(var(--accent))]/10"
          />
        </div>
      </Card>

      {/* Recent Transactions & Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <RecentTransactions transactions={stats?.recentTransactions ?? []} />
        </div>

        <div className="lg:col-span-2">
          <CategoryChartInline
            categoryTotals={
              stats?.topExpenseCategories?.map((c) => ({
                name: c.name,
                total: c.total,
              })) ?? []
            }
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, bg, prefix = "" }) {
  const display =
    value === undefined || value === null
      ? "—"
      : typeof value === "number"
        ? `${prefix}${Number(value).toLocaleString("en-ET", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ETB`
        : value;

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}
        >
          <Icon size={14} className={color} />
        </div>
        <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      </div>
      <div className={`text-xl lg:text-2xl font-black ${color}`}>{display}</div>
    </div>
  );
}
