import Spinner from "./Spinner.jsx";

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  children,
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-[rgb(var(--primary))] text-[rgb(var(--primary-fg))] hover:bg-[rgb(var(--primary-hover))] shadow-sm hover:shadow",
    ghost:
      "bg-transparent border border-[rgb(var(--border))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--card))]",
    danger:
      "bg-[rgb(var(--danger))] text-white hover:bg-[rgb(var(--danger-hover))] shadow-sm hover:shadow",
    success:
      "bg-[rgb(var(--success))] text-white hover:opacity-90 shadow-sm",
    link: "bg-transparent text-[rgb(var(--primary))] hover:underline p-0",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
}
