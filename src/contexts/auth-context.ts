import { createContext, useContext } from "react";
import { type Session, type User } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
});

export const useAuth = () => useContext(AuthContext);
