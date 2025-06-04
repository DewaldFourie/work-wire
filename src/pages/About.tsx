import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function About() {
    const navigate = useNavigate();

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
                        className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-900 dark:from-white dark:to-white"
                    >
                        About
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-500 dark:to-blue-500"> WorkWire</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-lg max-w-2xl text-gray-700 dark:text-gray-300"
                    >
                        WorkWire is your team's new digital hub. Designed to bring clarity,
                        collaboration, and connection to the modern workspace. Whether you're
                        part of a small team or a large enterprise, WorkWire helps you chat,
                        organize, and collaborate in real-time.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8, duration: 0.6 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10"
                    >
                        <FeatureCard
                            title="Real-Time Messaging"
                            description="Instantly connect with your team through sleek and reliable live messaging."
                        />
                        <FeatureCard
                            title="Group Chats"
                            description="Create focused spaces for project teams, departments, or company-wide announcements."
                        />
                        <FeatureCard
                            title="User Profiles"
                            description="Personalize your experience with avatars, bios, and skillsets."
                        />
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}

function FeatureCard({ title, description }: { title: string; description: string; }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-xl bg-gray-100 dark:bg-gray-700 p-6 shadow-md hover:shadow-lg transition-shadow"
        >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
        </motion.div>
    );
}
