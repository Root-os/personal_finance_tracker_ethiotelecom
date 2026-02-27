import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { Mail, RefreshCw } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Field from "../../components/ui/Field.jsx";
import Input from "../../components/ui/Input.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { normalizeApiError } from "../../lib/errors.js";
import { useToast } from "../../components/ui/ToastHost.jsx";

export default function CheckEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const resendVerification = useAuthStore((s) => s.resendVerification);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const startCooldown = useCallback(() => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const res = await resendVerification(email.trim());
      setMessage(res.message || "If an account with that email exists, a verification email has been sent.");
      toast.success("Verification email sent!");
      startCooldown();
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Check your email" subtitle="A verification link has been sent to your inbox.">
      <Card>
        <div className="space-y-6">
          {/* Hero section */}
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--primary))]/10">
              <Mail size={32} className="text-[rgb(var(--primary))]" />
            </div>
            <p className="text-sm text-[rgb(var(--muted))]">
              We sent a verification link to {email ? <strong className="text-[rgb(var(--fg))]">{email}</strong> : "your email address"}.
              Click the link to activate your account.
              The link expires in <strong>24 hours</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/login")} variant="ghost" className="w-full">
              Back to sign in
            </Button>
          </div>

          {/* Resend section */}
          <div className="border-t border-[rgb(var(--border))] pt-5">
            <div className="mb-3 text-sm font-medium">Didn&apos;t receive the email?</div>
            <form onSubmit={onSubmit} className="space-y-3">
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

              {message && (
                <div className="rounded-xl bg-[rgb(var(--success))]/10 border border-[rgb(var(--success))]/20 px-4 py-3 text-sm text-[rgb(var(--success))] animate-fade-in">
                  {message}
                </div>
              )}

              <Button
                loading={submitting}
                disabled={cooldown > 0}
                icon={RefreshCw}
                className="w-full"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}
