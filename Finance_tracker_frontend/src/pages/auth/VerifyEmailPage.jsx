import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, MailWarning } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const verifyEmail = useAuthStore((s) => s.verifyEmail);

  const [status, setStatus] = useState(token ? "verifying" : "no-token"); // verifying | success | error | no-token
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err?.message || "Verification failed");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [token, verifyEmail]);

  return (
    <AuthLayout title="Email Verification" subtitle="Confirming your email address.">
      <Card>
        <div className="py-6 text-center space-y-4">

          {/* Verifying */}
          {status === "verifying" && (
            <div className="space-y-4 animate-fade-in">
              <Spinner size="lg" />
              <p className="text-sm text-[rgb(var(--muted))]">
                Verifying your email…
              </p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="space-y-4 animate-slide-up">
              <CheckCircle
                size={56}
                className="mx-auto text-[rgb(var(--success))]"
              />
              <div>
                <h3 className="text-lg font-semibold">Email Verified!</h3>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  Your email has been verified successfully. You can now sign in to your account.
                </p>
              </div>
              <Link to="/login">
                <Button className="w-full" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="space-y-4 animate-slide-up">
              <XCircle
                size={56}
                className="mx-auto text-[rgb(var(--danger))]"
              />
              <div>
                <h3 className="text-lg font-semibold">Verification Failed</h3>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  {errorMsg}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/check-email">
                  <Button className="w-full" variant="ghost">
                    Resend verification email
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="w-full" variant="link" size="sm">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* No token */}
          {status === "no-token" && (
            <div className="space-y-4 animate-slide-up">
              <MailWarning
                size={56}
                className="mx-auto text-[rgb(var(--warning))]"
              />
              <div>
                <h3 className="text-lg font-semibold">No Verification Token</h3>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  It looks like you opened this page without a verification link. Please check your email for the verification link or request a new one.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/check-email">
                  <Button className="w-full">
                    Request verification email
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="w-full" variant="link" size="sm">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </div>
      </Card>
    </AuthLayout>
  );
}
