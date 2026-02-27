import { useMemo } from "react";
import { Check, X } from "lucide-react";

const criteria = [
    { key: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
    { key: "upper", label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { key: "lower", label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
    { key: "number", label: "Number", test: (p) => /\d/.test(p) },
    { key: "special", label: "Special character (@$!%*?&)", test: (p) => /[@$!%*?&]/.test(p) },
];

export function getPasswordScore(password) {
    if (!password) return 0;
    return criteria.filter((c) => c.test(password)).length;
}

export default function PasswordStrength({ password = "" }) {
    const results = useMemo(
        () => criteria.map((c) => ({ ...c, pass: c.test(password) })),
        [password]
    );

    const score = results.filter((r) => r.pass).length;
    const total = criteria.length;
    const pct = (score / total) * 100;

    const color =
        score <= 1
            ? "bg-[rgb(var(--danger))]"
            : score <= 2
                ? "bg-[rgb(var(--warning))]"
                : score <= 3
                    ? "bg-[rgb(var(--warning))]"
                    : score <= 4
                        ? "bg-[rgb(var(--info))]"
                        : "bg-[rgb(var(--success))]";

    const label =
        score <= 1 ? "Weak" : score <= 2 ? "Fair" : score <= 3 ? "Good" : score <= 4 ? "Strong" : "Excellent";

    if (!password) return null;

    return (
        <div className="space-y-2 animate-fade-in">
            {/* Strength bar */}
            <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-[rgb(var(--border))] overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-[rgb(var(--muted))]">{label}</span>
            </div>

            {/* Criteria list */}
            <div className="grid grid-cols-1 gap-1">
                {results.map((r) => (
                    <div key={r.key} className="flex items-center gap-1.5 text-xs">
                        {r.pass ? (
                            <Check size={12} className="text-[rgb(var(--success))] shrink-0" />
                        ) : (
                            <X size={12} className="text-[rgb(var(--muted))] shrink-0" />
                        )}
                        <span className={r.pass ? "text-[rgb(var(--success))]" : "text-[rgb(var(--muted))]"}>
                            {r.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
