import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { type ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    // Wait until Supabase has finished checking session
    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Loading session...</div>;
    }

    // If still no user after session check, redirect
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
