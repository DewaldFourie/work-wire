import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { type ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
