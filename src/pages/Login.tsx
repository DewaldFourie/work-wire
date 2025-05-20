import { useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { logInAsDemoUser } from "../lib/auth";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
        } else {
            navigate("/");
        }
    };

    const handleDemoLogin = async () => {
        try {
            await logInAsDemoUser();
            navigate("/");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };


    return (
        <div className="relative flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                {error && <p className="text-red-500 mb-3">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    className="input mb-2 w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="input mb-4 w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="btn w-full mb-2">Log In</button>
                <button type="button" className="btn w-full mb-2" onClick={handleDemoLogin}>
                    Continue as Demo User
                </button>
                <p className="text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
                </p>
            </form>
        </div>
    );
}
