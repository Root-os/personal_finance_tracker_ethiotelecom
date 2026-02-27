import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  className = "",
  icon: Icon,
  error,
  ...props
}) {
  const errorRing = error
    ? "ring-2 ring-[rgb(var(--danger))]/40 border-[rgb(var(--danger))]"
    : "";

  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]">
          <Icon size={16} />
        </div>
      )}
      <input
        className={`w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[rgb(var(--muted))]/60 focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-[rgb(var(--primary))] ${Icon ? "pl-10" : ""} ${errorRing} ${className}`}
        {...props}
      />
    </div>
  );
}

export function PasswordInput({ className = "", error, ...props }) {
  const [visible, setVisible] = useState(false);

  const errorRing = error
    ? "ring-2 ring-[rgb(var(--danger))]/40 border-[rgb(var(--danger))]"
    : "";

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 pr-10 text-sm outline-none transition-all duration-200 placeholder:text-[rgb(var(--muted))]/60 focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-[rgb(var(--primary))] ${errorRing} ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors cursor-pointer"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
