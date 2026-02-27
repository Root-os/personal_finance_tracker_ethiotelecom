import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-5 shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-base font-semibold">{title}</div>
        {description && (
          <div className="mt-2 text-sm text-[rgb(var(--muted))]">
            {description}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <Button variant="ghost" className="w-full" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            className="w-full"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
