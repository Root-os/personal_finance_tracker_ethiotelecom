export default function Card({ title, children, right, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 shadow-sm backdrop-blur-sm animate-fade-in ${className}`}
    >
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          ) : (
            <div />
          )}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
