import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, CheckCircle } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Field from "../../components/ui/Field.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { normalizeApiError } from "../../lib/errors.js";

export default function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a password reset link."
    >
      <Card>
        {!sent ? (
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Email address">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="Enter your email"
                icon={Mail}
                type="email"
              />
            </Field>

            {error && (
              <div className="rounded-xl bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20 px-4 py-3 text-sm text-[rgb(var(--danger))] animate-fade-in">
                {error}
              </div>
            )}

            <Button loading={submitting} icon={Send} className="w-full" size="lg">
              Send reset link
            </Button>

            <div className="text-sm text-center">
              <Link
                className="text-[rgb(var(--primary))] hover:underline transition-colors"
                to="/login"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4 animate-slide-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--success))]/10">
              <CheckCircle size={32} className="text-[rgb(var(--success))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Check your inbox</h3>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. The link expires in <strong>1 hour</strong>.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/login">
                <Button className="w-full" variant="ghost">
                  Back to sign in
                </Button>
              </Link>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-[rgb(var(--primary))] hover:underline cursor-pointer"
              >
                Try a different email
              </button>
            </div>
          </div>
        )}
      </Card>
    </AuthLayout>
  );
}
