import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, CheckCircle, XCircle } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Field from "../../components/ui/Field.jsx";
import { PasswordInput } from "../../components/ui/Input.jsx";
import PasswordStrength, { getPasswordScore } from "../../components/ui/PasswordStrength.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { normalizeApiError } from "../../lib/errors.js";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const verifyResetToken = useAuthStore((s) => s.verifyResetToken);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [tokenStatus, setTokenStatus] = useState(token ? "checking" : "invalid"); // checking | valid | invalid
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        await verifyResetToken(token);
        if (!cancelled) setTokenStatus("valid");
      } catch {
        if (!cancelled) setTokenStatus("invalid");
      }
    })();
    return () => { cancelled = true; };
  }, [token, verifyResetToken]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (getPasswordScore(password) < 5) {
      setError("Password does not meet all requirements");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Create a strong password for your account.">
      <Card>
        {/* Checking token */}
        {tokenStatus === "checking" && (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <Spinner size="lg" />
            <p className="text-sm text-[rgb(var(--muted))]">Validating your reset link…</p>
          </div>
        )}

        {/* Invalid/expired token */}
        {tokenStatus === "invalid" && (
          <div className="py-6 text-center space-y-4 animate-slide-up">
            <XCircle size={56} className="mx-auto text-[rgb(var(--danger))]" />
            <div>
              <h3 className="text-lg font-semibold">Invalid or Expired Link</h3>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                This reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button className="w-full">Request new reset link</Button>
            </Link>
            <Link to="/login">
              <Button className="w-full" variant="link" size="sm">Back to login</Button>
            </Link>
          </div>
        )}

        {/* Valid token — show form or success */}
        {tokenStatus === "valid" && !success && (
          <form onSubmit={onSubmit} className="space-y-5 animate-slide-up">
            <Field label="New Password">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
              />
              <PasswordStrength password={password} />
            </Field>

            <Field
              label="Confirm Password"
              error={passwordMismatch ? "Passwords do not match" : ""}
            >
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                error={passwordMismatch}
              />
              {passwordsMatch && (
                <div className="text-xs text-[rgb(var(--success))] animate-fade-in mt-1">
                  ✓ Passwords match
                </div>
              )}
            </Field>

            {error && (
              <div className="rounded-xl bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20 px-4 py-3 text-sm text-[rgb(var(--danger))] animate-fade-in">
                {error}
              </div>
            )}

            <Button loading={submitting} icon={KeyRound} className="w-full" size="lg">
              Reset password
            </Button>
          </form>
        )}

        {/* Success */}
        {tokenStatus === "valid" && success && (
          <div className="py-6 text-center space-y-4 animate-slide-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--success))]/10">
              <CheckCircle size={32} className="text-[rgb(var(--success))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Password Reset Complete</h3>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                Your password has been updated successfully. All other sessions have been logged out for security.
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full" size="lg">Sign in with new password</Button>
            </Link>
          </div>
        )}
      </Card>
    </AuthLayout>
  );
}
