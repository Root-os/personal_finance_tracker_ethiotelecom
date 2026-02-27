export default function Field({ label, hint, error, children }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">
          {label}
        </div>
      )}
      {children}
      {error ? (
        <div className="text-xs text-[rgb(var(--danger))] animate-fade-in">
          {error}
        </div>
      ) : hint ? (
        <div className="text-xs text-[rgb(var(--muted))]">{hint}</div>
      ) : null}
    </label>
  );
}
