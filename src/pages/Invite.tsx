import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Copy, Check, Mail } from "lucide-react";

export default function Invite() {
    const navigate = useNavigate();
    const inviteLink = `${window.location.origin}/`;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent("You're invited to WorkWire");
        const body = encodeURIComponent(
            `Hi there,\n\nI’m using WorkWire, a modern messaging tool built for productive teams and professionals.\n\nIt’s simple, clean, and gets the job done. Thought you might want to check it out.\n\n👉 Click here to join: ${inviteLink}\n\nLet me know what you think!\n\nStay Connected,\nThe WorkWire Team`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
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
                        className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-900 dark:from-white dark:to-white"
                    >
                        Invite to
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-500 dark:to-blue-500"> WorkWire</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-lg max-w-2xl text-gray-700 dark:text-gray-300 space-y-2"
                    >
                        <p className="text-lg font-bold">Want to bring someone on board? Share your unique WorkWire link below.</p>
                        <p>Anyone who signs up using it will get access to the WorkWire app and can start collaborating with you right away.</p>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.6 }}
                        className="w-full max-w-xl flex flex-col items-center gap-4"
                    >
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg w-full flex items-center justify-between">
                            <span className="text-md truncate text-gray-700 dark:text-gray-300">{inviteLink}</span>
                            <button
                                onClick={handleCopy}
                                className="ml-4 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                                aria-label="Copy invite link"
                            >
                                {copied ? <Check className="text-green-500" size={20} /> : <Copy size={20} />}
                            </button>
                        </div>

                        <button
                            onClick={handleEmailShare}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Mail size={18} />
                            Share via Email
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}
