import { useAuth } from "../contexts/auth-context";
import { signOut } from "../lib/auth";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import { House, Contact, BookText, Settings, LogOut, Users, ExternalLink } from "lucide-react";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path: string) => {
        if (path === "/") return currentPath === "/";
        return currentPath.startsWith(path);
    };

    const baseButtonClasses =
        "w-48 flex items-center px-8 py-2 rounded-lg shadow-md font-medium gap-2 transition-all duration-200 ease-in-out transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-lg border-l-4";

    return (
        <div className="w-64 bg-gray-200 dark:bg-gray-900 h-screen flex flex-col justify-between p-4 pb-2">
            <div>
                {/* Logo */}
                <div className="flex items-center gap-4 mb-6">
                    <img src="/WorkWireLogo.webp" alt="logo" height={45} width={45} />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">WorkWire</h1>
                </div>
                {/* Nav Buttons */}
                <nav className="flex flex-col gap-2 items-center">
                    <button
                        onClick={() => navigate("/")}
                        className={`${baseButtonClasses} ${
                            isActive("/")
                                ? "bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                                : "bg-blue-600 hover:bg-blue-700 border-transparent text-white"
                        }`}
                    >
                        <House className="w-5 h-5" />
                        Home
                    </button>
                    <button
                        onClick={() => navigate("/groups")}
                        className={`${baseButtonClasses} ${
                            isActive("/groups")
                                ? "bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                                : "bg-blue-600 hover:bg-blue-700 border-transparent text-white"
                        }`}
                    >
                        <Users className="w-5 h-5" />
                        Groups
                    </button>
                    <button
                        onClick={() => user && navigate(`/profile/${user.id}`)}
                        className={`${baseButtonClasses} ${
                            isActive("/profile")
                                ? "bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                                : "bg-blue-600 hover:bg-blue-700 border-transparent text-white"
                        }`}
                    >
                        <Contact className="w-5 h-5" />
                        Profile
                    </button>
                    <button
                        onClick={() => navigate("/settings")}
                        className={`${baseButtonClasses} ${
                            isActive("/settings")
                                ? "bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                                : "bg-blue-600 hover:bg-blue-700 border-transparent text-white"
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                    <button
                        onClick={() => navigate("/about")}
                        className={`${baseButtonClasses} ${
                            isActive("/about")
                                ? "bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                                : "bg-blue-600 hover:bg-blue-700 border-transparent text-white"
                        }`}
                    >
                        <BookText className="w-5 h-5" />
                        About
                    </button>
                    <button
                        onClick={() => navigate("/invite")}
                        className={`${baseButtonClasses} ${
                            isActive("/invite")
                                ? "bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                                : "bg-blue-600 hover:bg-blue-700 border-transparent text-white"
                        }`}
                    >
                        <ExternalLink className="w-5 h-5" />
                        Share
                    </button>
                    
                </nav>
            </div>
            {/* Footer Controls */}
            <div className="flex flex-col justify-center items-center mt-4">
                <div className="w-full flex items-center justify-center gap-14 text-gray-600 dark:text-gray-400">
                    <span>Theme</span>
                    <span>Sound</span>
                </div>
                <div className="w-full flex items-center justify-center gap-4 mb-4">
                    <ThemeToggle width={80} height={30} />
                    <SoundToggle width={80} height={30} />
                </div>

                <button
                    onClick={signOut}
                    className="w-48 flex items-center px-8 py-2 mb-2 rounded-lg shadow-md font-medium gap-2 transition-all ease-in-out transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-lg bg-blue-600 hover:bg-red-800 text-white"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {user ? `Logged in as ${user.user_metadata.username}` : "Not logged in"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Created by &copy;DewaldFourie {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
