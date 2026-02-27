import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserPlus, User, Mail, AtSign } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Field from "../../components/ui/Field.jsx";
import Input, { PasswordInput } from "../../components/ui/Input.jsx";
import PasswordStrength, { getPasswordScore } from "../../components/ui/PasswordStrength.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { fieldErrorMap, normalizeApiError } from "../../lib/errors.js";
import { useToast } from "../../components/ui/ToastHost.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (getPasswordScore(password) < 5) {
      setFieldErrors({ password: "Password does not meet all requirements" });
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, userName, email: email || undefined, password });
      if (email?.trim()) {
        toast.info("Account created! Please verify your email.");
        navigate("/check-email", { replace: true, state: { email: email.trim() } });
      } else {
        toast.success("Account created successfully!");
        navigate("/app", { replace: true });
      }
    } catch (err) {
      const n = normalizeApiError(err);
      setError(n.message);
      setFieldErrors(fieldErrorMap(n.fieldErrors));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your income and expenses.">
      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Full Name" error={fieldErrors.name}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Abebe Bikila"
              icon={User}
              error={fieldErrors.name}
            />
          </Field>

          <Field label="Username" error={fieldErrors.userName}>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
              placeholder="abebe123"
              icon={AtSign}
              error={fieldErrors.userName}
            />
          </Field>

          <Field
            label="Email (optional)"
            hint="If provided, you must verify it before signing in."
            error={fieldErrors.email}
          >
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="abebe@example.com"
              icon={Mail}
              type="email"
              error={fieldErrors.email}
            />
          </Field>

          <Field
            label="Password"
            error={fieldErrors.password}
          >
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              error={fieldErrors.password}
            />
            <PasswordStrength password={password} />
          </Field>

          <Field
            label="Confirm Password"
            error={fieldErrors.confirmPassword || (passwordMismatch ? "Passwords do not match" : "")}
          >
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              error={fieldErrors.confirmPassword || passwordMismatch}
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

          <Button loading={submitting} icon={UserPlus} className="w-full" size="lg">
            Create account
          </Button>

          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link
              className="text-[rgb(var(--primary))] hover:underline transition-colors font-medium"
              to="/login"
            >
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
