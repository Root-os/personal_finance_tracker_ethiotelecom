import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, LayoutDashboard, ListPlus, Tag, User, Sun, Moon, Wallet } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useAuthStore } from "../../stores/authStore.js";

const nav = [
  { to: "/app", label: "Home", icon: LayoutDashboard },
  { to: "/app/transactions", label: "Txns", icon: ListPlus },
  { to: "/app/categories", label: "Tags", icon: Tag },
  { to: "/app/analytics", label: "Stats", icon: BarChart3 },
  { to: "/app/profile", label: "Profile", icon: User },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const me = useAuthStore((s) => s.me);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--card))]/50 backdrop-blur-xl sticky top-0 h-dvh">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-[rgb(var(--border))]">
          <Wallet className="text-[rgb(var(--primary))]" size={24} />
          <span className="font-bold tracking-tight text-lg">Finance Tracker</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${active
                  ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                  : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--primary))]/5 hover:text-[rgb(var(--fg))]"
                  }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {item.label === "Txns" ? "Transactions" : item.label === "Tags" ? "Categories" : item.label === "Stats" ? "Analytics" : item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgb(var(--border))]">
          {me && (
            <div className="flex items-center gap-3 px-4 py-2 bg-[rgb(var(--primary))]/5 rounded-xl border border-[rgb(var(--primary))]/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--primary))]/20 text-xs font-bold text-[rgb(var(--primary))]">
                {me?.userName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-sm font-semibold truncate">{me.name || me.userName}</span>
                <span className="text-[10px] text-[rgb(var(--muted))] truncate">@{me.userName}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top bar (Visible on Mobile, specialized on Desktop) */}
        <header className="sticky top-0 z-10 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 backdrop-blur-md lg:bg-transparent lg:border-none lg:backdrop-blur-none">
          <div className="mx-auto flex w-full max-w-xl lg:max-w-none items-center justify-between px-4 py-3 lg:px-8 lg:py-6">
            <div className="flex items-center gap-2 lg:hidden">
              <Wallet size={18} className="text-[rgb(var(--primary))]" />
              <span className="text-sm font-bold tracking-tight">Personal Finance</span>
            </div>

            {/* Desktop breadcrumb/title placeholder */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-black tracking-tight">
                {nav.find(n => n.to === location.pathname)?.label === "Txns" ? "Transactions" :
                  nav.find(n => n.to === location.pathname)?.label === "Tags" ? "Categories" :
                    nav.find(n => n.to === location.pathname)?.label === "Stats" ? "Analytics" :
                      nav.find(n => n.to === location.pathname)?.label || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop Theme Toggle */}
              <div className="hidden lg:flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2.5 text-[rgb(var(--muted))] transition-all hover:text-[rgb(var(--fg))] hover:bg-[rgb(var(--primary))]/5 cursor-pointer shadow-sm"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                {me && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--primary))]/10 text-xs font-bold text-[rgb(var(--primary))]">
                    {me?.userName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <button
                  onClick={toggleTheme}
                  className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-1.5 text-[rgb(var(--muted))] transition-all hover:text-[rgb(var(--fg))] cursor-pointer"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto w-full max-w-xl lg:max-w-7xl px-4 pb-24 lg:pb-8 pt-0 lg:px-8">
          <Outlet />
        </main>

        {/* Bottom navigation (Mobile only) */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between px-2 py-1.5">
            {nav.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors cursor-pointer ${active
                    ? "text-[rgb(var(--primary))]"
                    : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
                    }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span className="leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
