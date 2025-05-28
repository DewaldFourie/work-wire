import { useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { logInAsDemoUser } from "../lib/auth";
import ThemeToggle from "../components/ThemeToggle";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/use-theme";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const backgroundImage = theme === "dark" ? "/dark-right.webp" : "/light-right.webp";

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
            <div className="hidden lg:flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                {/* Left Panel - Login Form */}
                <div className="absolute top-4 right-4 z-20">
                    <ThemeToggle width={70} height={30}/>
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
                        <div className="width-full flex items-center justify-center gap-4">
                            <img src="./WorkWireLogo.webp" alt="" height={40} width={40} />
                            <h2 className="text-4xl font-semibold text-center">Login</h2>
                        </div>
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
                            className="bg-[#0065F8] text-white text-base font-medium py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="bg-indigo-500 text-white text-base font-medium py-2 rounded hover:bg-indigo-700 transition-colors"
                        >
                            Continue as Demo User
                        </button>
                        <p className="text-sm text-center mt-2">
                            New to WorkWire?{" "}
                            <Link to="/register" className="text-blue-500 hover:underline">
                                Create an Account
                            </Link>
                        </p>
                    </form>
                </motion.div>
                {/* Right Panel - Welcome Message over Image */}
                <div className="w-2/3 relative bg-cover bg-center overflow-hidden">
                    <img
                        src={backgroundImage}
                        alt="Background"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 dark:opacity-40"
                    />
                    <div
                        className={`absolute inset-0 bg-gradient-to-bl ${theme === "dark"
                            ? "from-gray-900/60 to-transparent"
                            : "from-white/90 via-white/70 to-transparent"
                            }`}
                    ></div>
                    <div
                        className={`absolute inset-0 flex top-[30%]  justify-center ${theme === "light" ? "pl-14 " : ""}`}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                            className="text-center px-10"
                        >
                            <h1
                                className="text-5xl font-extrabold mb-4 text-black dark:text-white
                                    drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)]
                                    dark:drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]
                                    tracking-tight"
                            >
                                Welcome to WorkWire
                            </h1>
                            <p
                                className="text-xl font-semibold max-w-xl mx-auto text-black dark:text-white/90
                                    drop-shadow-[0_3px_2px_rgba(0,0,0,0.2)]
                                    dark:drop-shadow-[0_5px_6px_rgba(0,0,0,0.5)]"
                            >
                                Connect, collaborate, and communicate effortlessly with your team.
                            </p>
                        </motion.div>
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
