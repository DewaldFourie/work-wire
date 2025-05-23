import { useState } from "react";
import { signUpWithEmail } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

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
		<div className="relative flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			<form
				onSubmit={handleRegister}
				className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded shadow-md w-96"
			>
				<h2 className="text-2xl font-bold mb-4">Register</h2>
				{error && <p className="text-red-500 mb-3">{error}</p>}
				<input
					type="text"
					placeholder="Username"
					className="input mb-2 w-full dark:text-black"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					type="email"
					placeholder="Email"
					className="input mb-2 w-full dark:text-black"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type="password"
					placeholder="Password"
					className="input mb-4 w-full dark:text-black"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit" className="btn w-full mb-2">Sign Up</button>
				<p className="text-sm">
					Already have an account?{" "}
					<Link to="/login" className="text-blue-500 hover:underline">Login</Link>
				</p>
			</form>
		</div>
	);
}
