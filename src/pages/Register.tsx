import { useState } from "react";
import { signUpWithEmail } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { motion } from "framer-motion";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

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
		<div className="relative flex h-screen bg-gray-100 dark:bg-gray-900">
			{/* Theme Toggle always fixed top right */}
			<div className="absolute top-4 right-4 z-20">
				<ThemeToggle />
			</div>
			{/* Left panel with background image + welcome text */}
			<div className="w-2/3 relative bg-cover bg-center overflow-hidden">
				<img
					src="/images/register-bg.jpg"
					alt="Welcome Background"
					className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-40"
				/>
				<div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center">
					<div className="text-white text-center px-10">
						<h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Join the Conversation</h1>
						<p className="text-lg md:text-xl font-medium max-w-xl mx-auto text-white/90 drop-shadow">
							Sign up to connect, share, and chat with people across the platform.
						</p>
					</div>
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
					<h2 className="text-2xl font-semibold text-center">Register</h2>
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
						placeholder="Password"
						className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-black"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button
						type="submit"
						className="bg-indigo-500 text-white text-sm font-medium py-2 rounded hover:bg-indigo-600 transition-colors"
					>
						Sign Up
					</button>
					<p className="text-xs text-center mt-2">
						Already have an account?{" "}
						<Link to="/login" className="text-blue-500 hover:underline">
							Login
						</Link>
					</p>
				</form>
			</motion.div>
		</div>
	);
}
