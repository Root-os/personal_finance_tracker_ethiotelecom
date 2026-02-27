import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import Spinner from "../components/ui/Spinner.jsx";

export default function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrating = useAuthStore((s) => s.hydrating);

  if (hydrating) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
}
