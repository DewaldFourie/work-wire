import { useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { logInAsDemoUser } from "../lib/auth";
import ThemeToggle from "../components/ThemeToggle";
import { motion } from "framer-motion";

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
        <>
            {/* Desktop layout */}
            <div className="hidden lg:flex h-screen w-full overflow-hidden bg-gray-900 dark:bg-gray-100">
                {/* Left Panel - Login Form */}
                <div className="absolute top-4 right-4 z-20">
                    <ThemeToggle />
                </div>
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-1/3 bg-white dark:bg-gray-800 p-10 flex flex-col justify-center shadow-xl z-10"
                >
                    <form
                        onSubmit={handleLogin}
                        className="w-full max-w-sm mx-auto text-black dark:text-white flex flex-col gap-4"
                    >
                        <h2 className="text-2xl font-semibold text-center">Login</h2>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <input
                            type="email"
                            placeholder="Email"
                            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-black"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="submit"
                            className="bg-indigo-500 text-white text-sm font-medium py-2 rounded hover:bg-indigo-600 transition-colors"
                        >
                            Log In
                        </button>

                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="bg-blue-500 text-white text-sm font-medium py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Continue as Demo User
                        </button>

                        <p className="text-xs text-center mt-2">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-blue-500 hover:underline">
                                Register
                            </Link>
                        </p>
                    </form>

                </motion.div>


                {/* Right Panel - Welcome Message over Image */}
                <div
                    className="w-2/3 relative bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/images/login-bg.jpg')", // Change this path if needed
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-white text-center px-10">
                            <h1 className="text-4xl font-extrabold mb-4">Welcome to WorkWire</h1>
                            <p className="text-lg font-medium max-w-xl mx-auto">
                                Connect, collaborate, and communicate effortlessly with your team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile fallback */}
            <div className="lg:hidden flex items-center justify-center h-screen px-6 bg-gray-100 dark:bg-gray-900 text-center">
                <div>
                    <ThemeToggle />
                    <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                        WorkWire is only available on desktop. Please use a larger screen to log in.
                    </p>
                </div>
            </div>
        </>
    );
}
