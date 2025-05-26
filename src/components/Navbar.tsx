import { useAuth } from "../contexts/auth-context";
import { signOut } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-gray-200 dark:bg-gray-900 h-screen flex flex-col justify-between p-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">WorkWire</h1>
                <nav className="flex flex-col gap-2">
                    <button onClick={() => navigate("/")} className="btn">Home</button>
                    <button onClick={() => user && navigate(`/profile/${user.id}`)} className="btn">Profile</button>
                </nav>
            </div>
            <div className="flex flex-col gap-2 ">
                <div className="w-full flex items-center justify-center mb-1">
                    <ThemeToggle width={70} height={30} />
                </div>       
                <button onClick={signOut} className="btn">Log Out</button>
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user ? `Logged in as ${user.email}` : "Not logged in"}
                    </p>
                </div>
            </div>
        </div>
    );
}
