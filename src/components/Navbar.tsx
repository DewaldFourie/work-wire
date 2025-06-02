import { useAuth } from "../contexts/auth-context";
import { signOut } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import { House, Contact, BookText, Settings, LogOut, Users } from "lucide-react";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-gray-200 dark:bg-gray-900 h-screen flex flex-col justify-between p-4 pb-2">
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <img src="/WorkWireLogo.webp" alt="logo" height={45} width={45} />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">WorkWire</h1>
                </div>
                <nav className="flex flex-col items-center gap-2">
                    <button onClick={() => navigate("/")} className="btn btn-icon-gap">
                        <House className="w-5 h-5" />
                        Home
                    </button>
                    <button onClick={() => navigate("/groups")} className="btn">
                        <Users className="w-5 h-5" />
                        Groups
                    </button>
                </nav>
            </div>
            <div>
                <div className="mb-8">
                    <nav className="flex flex-col items-center gap-2">
                        <button onClick={() => user && navigate(`/profile/${user.id}`)} className="btn btn-icon-gap">
                            <Contact className="w-5 h-5" />
                            Profile
                        </button>
                        <button onClick={() => navigate("/about")} className="btn btn-icon-gap">
                            <BookText className="w-5 h-5" />
                            About
                        </button>
                        <button onClick={() => navigate("/settings")} className="btn btn-icon-gap">
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>
                    </nav>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <div className="w-full flex items-center justify-center gap-14 text-gray-600 dark:text-gray-400">
                        <span className="mb-0">Theme</span>
                        <span className="mb-0 ml-3">Sound</span>
                    </div>
                    <div className="w-full flex items-center justify-center gap-4 mb-4">
                        <ThemeToggle width={80} height={30} />
                        <SoundToggle width={80} height={30} />
                    </div>
                    <button onClick={signOut} className="btn btn-icon-gap mb-2">
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {user ? `Logged in as ${user.user_metadata.username}` : "Not logged in"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Created by &copy;DewaldFourie {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}
