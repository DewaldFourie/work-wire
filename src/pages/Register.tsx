import { useState } from "react";
import { signUpWithEmail } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/use-theme"; // Make sure this is correctly imported

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const { theme } = useTheme();

	const backgroundImage = theme === "dark" ? "/dark-left.webp" : "/light-left.webp";

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await signUpWithEmail({ email, password, username });
			navigate("/");
		} catch (err) {
			setError((err as Error).message);
		}
	};

	return (
		<>
			{/* Desktop layout */}
			<div className="hidden lg:flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
				{/* Theme Toggle */}
				<div className="absolute top-4 right-4 z-20">
					<ThemeToggle width={70} height={30}/>
				</div>
				{/* Left panel with image and welcome message */}
				<div className="w-2/3 relative bg-cover bg-center overflow-hidden">
					<img
						src={backgroundImage}
						alt="Background"
						loading="lazy"
						className="absolute inset-0 w-full h-full object-cover object-center opacity-40 dark:opacity-40"
					/>
					<div
                        className={`absolute inset-0 bg-gradient-to-br ${theme === "dark"
                                ? "from-gray-900/60  to-transparent"
                                : "from-white/90 via-white/70 to-transparent"
                            }`}
                    />
					<div
						className={`absolute inset-0 flex top-[30%] justify-center ${theme === "light" ? "pr-24 " : ""}`}
					>
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
							className="text-center px-10"
						>
							<h1 className="text-5xl font-extrabold mb-4 text-black dark:text-white
                                    drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)]
                                    dark:drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]
                                    tracking-tight"
							>
								Join the Conversation
							</h1>
							<p
                                className="text-xl font-semibold max-w-xl mx-auto text-black dark:text-white/90
                                    drop-shadow-[0_3px_2px_rgba(0,0,0,0.2)]
                                    dark:drop-shadow-[0_5px_6px_rgba(0,0,0,0.5)]"
                            >
								Sign up to connect, share, and chat with people across the platform.
							</p>
						</motion.div>
					</div>
				</div>
				{/* Right panel with animated form */}
				<motion.div
					initial={{ x: "-100%", opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="w-1/3 bg-white dark:bg-gray-800 flex items-center justify-center p-6 shadow-xl z-10"
				>
					<form
						onSubmit={handleRegister}
						className="w-full max-w-sm mx-auto text-black dark:text-white flex flex-col gap-4"
					>
						<div className="width-full flex items-center justify-center gap-4">
                            <h2 className="text-4xl font-semibold text-center">Sign Up</h2>
							<img src="./WorkWireLogo.webp" alt="" height={40} width={40} />
                        </div>
						{error && <p className="text-red-500 text-sm text-center">{error}</p>}
						<input
							type="text"
							placeholder="Username"
							className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-black"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<input
							type="email"
							placeholder="Email"
							className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-black"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							type="password"
							placeholder="Create Password"
							className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-black"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button
							type="submit"
							className="bg-[#0065F8] text-white text-base font-medium py-2 rounded hover:bg-blue-700 transition-colors"
						>
							Sign Up
						</button>
						<p className="text-sm text-center mt-2">
							Already have an account?{" "}
							<Link to="/login" className="text-blue-500 hover:underline">
								Login
							</Link>
						</p>
					</form>
				</motion.div>
			</div>
			{/* Mobile fallback */}
			<div className="lg:hidden flex items-center justify-center h-screen px-6 bg-gray-100 dark:bg-gray-900 text-center">
				<div>
					<ThemeToggle />
					<p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
						WorkWire is only available on desktop. Please use a larger screen to register.
					</p>
				</div>
			</div>
		</>
	);
}
