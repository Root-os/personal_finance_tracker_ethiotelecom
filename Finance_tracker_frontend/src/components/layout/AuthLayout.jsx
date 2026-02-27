import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { Sun, Moon, Wallet } from "lucide-react";

export default function AuthLayout({ title, subtitle, children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-dvh">
      {/* ── Left panel — gradient branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))] via-[rgb(var(--accent))] to-[rgb(var(--info))] animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <Wallet size={24} />
            Personal Finance
          </Link>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight">
              Take control of your finances
            </h2>
            <p className="mt-3 text-base text-white/80">
              Track income, manage expenses, and gain insights into your financial health — all in one place.
            </p>
          </div>
          <div className="text-xs text-white/50">
            Secure sessions • Token rotation • Multi-device support
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight lg:hidden"
          >
            <Wallet size={18} className="text-[rgb(var(--primary))]" />
            Personal Finance
          </Link>
          <div className="lg:ml-auto">
            <button
              onClick={toggleTheme}
              className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-[rgb(var(--muted))] transition-all hover:text-[rgb(var(--fg))] hover:shadow-sm cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="animate-slide-up">{children}</div>
          </div>
        </div>

        <footer className="px-5 py-4 text-center text-xs text-[rgb(var(--muted))] lg:px-8">
          &copy; {new Date().getFullYear()} Personal Finance Tracker. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
