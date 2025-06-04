import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/use-theme";
import { useSound } from "../contexts/use-sound";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useAuth } from "../contexts/auth-context";


export default function Settings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { isMuted, toggleSound } = useSound();
    const [isPublic, setIsPublic] = useState<boolean | null>(null);


    useEffect(() => {
        const fetchPrivacy = async () => {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from("users")
                .select("public")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Error fetching privacy status:", error.message);
                return;
            }

            setIsPublic(data.public);
        };

        fetchPrivacy();
    }, [user]);

    const togglePrivacy = async () => {
        if (!user?.id || isPublic === null) return;

        const { error } = await supabase
            .from("users")
            .update({ public: !isPublic })
            .eq("id", user.id);

        if (error) {
            console.error("Failed to update privacy setting:", error.message);
            return;
        }

        setIsPublic((prev) => !prev);
    };

    return (
        <>
            <button
                onClick={() => navigate("/")}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Close and go home"
            >
                <X className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            </button>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-[80%] h-[800px] mx-auto mt-14 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gray-900 flex flex-col"
            >
                <div className="relative flex-1 p-12 flex flex-col items-center justify-center gap-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-5xl pb-4 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-900 dark:from-white dark:to-white"
                    >
                        Settings
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-500 dark:to-blue-500"> Panel</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-lg max-w-2xl text-gray-700 dark:text-gray-300"
                    >
                        Customize your WorkWire experience. Update your preferences, toggle appearance,
                        and control your privacy settings with ease.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8, duration: 0.6 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full max-w-4xl"
                    >
                        <SettingCard
                            title={
                                theme === "dark" ? (
                                    <span className="inline-flex items-center gap-2">
                                        Dark Mode <Moon className="w-5 h-5 text-blue-500" />
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        Light Mode <Sun className="w-5 h-5 text-yellow-500" />
                                    </span>
                                )
                            }
                            description={`Currently using ${theme} mode. Click to switch.`}
                            onClick={toggleTheme}
                        />
                        <SettingCard
                            title={
                                <>
                                    Notifications{" "}
                                    <span className={isMuted ? "text-red-600" : "text-green-600"}>
                                        {isMuted ? "Off" : "On"}
                                    </span>
                                </>
                            }
                            description={
                                isMuted
                                    ? "Sound is currently muted. Click to enable notifications."
                                    : "Sound is enabled. Click to mute notifications."
                            }
                            onClick={toggleSound}
                        />
                        <SettingCard
                            title={
                                isPublic === null ? (
                                    "Loading Privacy..."
                                ) : (
                                    <>
                                        Profile is{" "}
                                        <span className={isPublic ? "text-green-600" : "text-red-600"}>
                                            {isPublic ? "Public" : "Private"}
                                        </span>
                                    </>
                                )
                            }
                            description={
                                isPublic === null
                                    ? "Fetching your privacy setting..."
                                    : isPublic
                                        ? "Your profile is visible to others. Click to hide it."
                                        : "Your profile is hidden. Click to make it public."
                            }
                            onClick={togglePrivacy}
                        />
                        <SettingCard
                            title="Account"
                            description="Your account details are managed by the system administrator. Click to contact them for support."
                            onClick={() => window.open("https://portfolio-website-pied-five.vercel.app/", "_blank")}
                        />

                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}

function SettingCard({
    title,
    description,
    onClick,
}: {
    title: React.ReactNode;
    description: string;
    onClick?: () => void;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className="transform-gpu rounded-xl bg-gray-100 dark:bg-gray-700 p-6 shadow-md transition-shadow cursor-pointer 
                border-2 border-transparent hover:shadow-xl hover:border-blue-600"
        >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
        </motion.div>
    );
}
