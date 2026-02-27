import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, Monitor, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Field from "../../components/ui/Field.jsx";
import Input from "../../components/ui/Input.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import { useToast } from "../../components/ui/ToastHost.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { api } from "../../lib/api.js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useAuthStore((s) => s.me);
  const hydrateMe = useAuthStore((s) => s.hydrateMe);
  const logout = useAuthStore((s) => s.logout);
  const logoutAll = useAuthStore((s) => s.logoutAll);
  const sessions = useAuthStore((s) => s.sessions);
  const currentSid = useAuthStore((s) => s.currentSid);
  const sessionsLoading = useAuthStore((s) => s.sessionsLoading);
  const fetchSessions = useAuthStore((s) => s.fetchSessions);
  const revokeSession = useAuthStore((s) => s.revokeSession);

  const [name, setName] = useState(me?.name || "");
  const [email, setEmail] = useState(me?.email || "");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [securityBusy, setSecurityBusy] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/api/v1/users/me", { name, email }, { accessToken });
      await hydrateMe();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    setSecurityBusy(true);
    try {
      await logout();
      toast.info("Logged out");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSecurityBusy(false);
    }
  };

  const onLogoutAll = async () => {
    setConfirmOpen(false);
    setSecurityBusy(true);
    try {
      await logoutAll();
      toast.info("Logged out from all devices");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSecurityBusy(false);
    }
  };

  const onRevoke = async (id) => {
    setRevokingId(id);
    try {
      await revokeSession(id);
      toast.success("Session revoked");

      // If revoking CURRENT session, logout instantly
      if (id === currentSid) {
        toast.info("Your current session was revoked. Logging out...");
        setTimeout(async () => {
          await logout();
          navigate("/login", { replace: true });
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || "Failed to revoke");
    } finally {
      setRevokingId(null);
    }
  };

  const onDeleteAccount = async () => {
    setSecurityBusy(true);
    try {
      await api.del("/api/v1/users/me", { accessToken });
      toast.info("Account permanently deleted");
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
      setSecurityBusy(false);
      setDeleteOpen(false);
    }
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  const parseUA = (ua) => {
    if (!ua) return "Unknown Device";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Android")) return "Android Device";
    if (ua.includes("Macintosh")) return "MacBook / Mac";
    if (ua.includes("Linux")) return "Linux Device";
    return "Web Browser";
  };

  return (
    <div className="space-y-4">
      {/* Profile info */}
      <Card title="Your Profile">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] text-xl font-bold">
              {me?.userName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="text-base font-semibold">{me?.userName}</div>
              <div className="text-xs text-[rgb(var(--muted))]">{me?.email || "No email"}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                {me?.emailVerified ? (
                  <span className="text-[rgb(var(--success))]">✓ Email verified</span>
                ) : me?.email ? (
                  <span className="text-[rgb(var(--warning))]">⚠ Email not verified</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit profile */}
      <Card title="Edit Profile">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </Field>
          <Button onClick={save} loading={saving}>
            Save changes
          </Button>
        </div>
      </Card>

      {/* Active sessions */}
      <Card title="Active Sessions" right={
        <Button variant="link" size="sm" onClick={fetchSessions} loading={sessionsLoading}>
          Refresh
        </Button>
      }>
        <div className="space-y-3">
          <p className="text-xs text-[rgb(var(--muted))]">
            These are the devices currently signed in to your account. Revoke any session you don&apos;t recognize.
          </p>

          {sessionsLoading && sessions.length === 0 ? (
            <div className="py-4 text-center"><Spinner /></div>
          ) : sessions.length === 0 ? (
            <p className="py-4 text-center text-sm text-[rgb(var(--muted))]">No active sessions</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${s.id === currentSid
                    ? "border-[rgb(var(--primary))]/30 bg-[rgb(var(--primary))]/5"
                    : "border-[rgb(var(--border))]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Monitor
                      size={18}
                      className={s.id === currentSid ? "text-[rgb(var(--primary))]" : "text-[rgb(var(--muted))]"}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{parseUA(s.userAgent)}</span>
                        {s.id === currentSid && (
                          <span className="rounded-full bg-[rgb(var(--primary))]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
                            This Device
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[rgb(var(--muted))] flex items-center gap-2">
                        <span>{s.ipAddress || "Unknown IP"}</span>
                        {s.location && (
                          <>
                            <span>•</span>
                            <span>{s.location}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Active {formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    loading={revokingId === s.id}
                    onClick={() => onRevoke(s.id)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Security */}
      <Card title="Security">
        <div className="space-y-3">
          <p className="text-xs text-[rgb(var(--muted))]">
            Manage your sessions. Logging out from all devices revokes every active refresh token.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              icon={LogOut}
              onClick={onLogout}
              loading={securityBusy}
              className="flex-1"
            >
              Logout this device
            </Button>
            <Button
              variant="danger"
              icon={Shield}
              onClick={() => setConfirmOpen(true)}
              disabled={securityBusy}
              className="flex-1"
            >
              Logout all devices
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger zone — delete account */}
      <Card title="Danger Zone" className="border-[rgb(var(--danger))]/30">
        <div className="space-y-3">
          <p className="text-xs text-[rgb(var(--muted))]">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="danger"
            onClick={() => setDeleteOpen(true)}
            disabled={securityBusy}
          >
            Delete my account
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Log out from all devices?"
        description="This will revoke all sessions and you'll need to sign in again on every device."
        confirmText={securityBusy ? "Working…" : "Logout all"}
        cancelText="Cancel"
        danger
        onClose={() => setConfirmOpen(false)}
        onConfirm={onLogoutAll}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        description="This will permanently delete your account and all your data (transactions, categories, etc.). This cannot be undone."
        confirmText="Delete forever"
        cancelText="Keep my account"
        danger
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDeleteAccount}
      />
    </div>
  );
}

