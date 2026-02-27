import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";

export default function GuestRoute({ children }) {
    const accessToken = useAuthStore((s) => s.accessToken);

    if (accessToken) return <Navigate to="/app" replace />;
    return children;
}
