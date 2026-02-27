import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Field from "../../components/ui/Field.jsx";
import Input, { PasswordInput } from "../../components/ui/Input.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { normalizeApiError } from "../../lib/errors.js";
import { useToast } from "../../components/ui/ToastHost.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const login = useAuthStore((s) => s.login);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !password) return;
    setError("");
    setSubmitting(true);
    try {
      await login({ userName: userName.trim(), password });
      toast.success("Welcome back!");
      navigate("/app", { replace: true });
    } catch (err) {
      const n = normalizeApiError(err);
      if (n.status === 403 && n.message.toLowerCase().includes("email not verified")) {
        setError(
          "Your email is not verified yet. Please check your inbox or resend the verification email."
        );
      } else {
        setError(n.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue.">
      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Username or Email">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
              placeholder="e.g. abebe123 or abebe@example.com"
              icon={Mail}
            />
          </Field>

          <Field label="Password">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </Field>

          {error && (
            <div className="rounded-xl bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20 px-4 py-3 text-sm text-[rgb(var(--danger))] animate-fade-in">
              {error}
            </div>
          )}

          <Button loading={submitting} icon={LogIn} className="w-full" size="lg">
            Sign in
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link
              className="text-[rgb(var(--primary))] hover:underline transition-colors"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
            <Link
              className="text-[rgb(var(--primary))] hover:underline transition-colors"
              to="/register"
            >
              Create account
            </Link>
          </div>
        </form>
      </Card>

      <div className="mt-6 text-center text-xs text-[rgb(var(--muted))]">
        Need to verify your email?{" "}
        <Link to="/check-email" className="text-[rgb(var(--primary))] hover:underline">
          Resend verification
        </Link>
      </div>
    </AuthLayout>
  );
}
