import { useState, useEffect } from "react";
import type { UserProfile } from "../types";
import { supabase } from "../supabase/client";
import type { Message } from "../types";
import { CheckCheck, PackageOpen } from "lucide-react";
import { motion } from "framer-motion";


type Props = {
    contact: UserProfile;
    currentUser: UserProfile;
};

const ChatWindow = ({ contact, currentUser }: Props) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);


    // Fetch messages when the component mounts or when the contact changes
    // This effect will run whenever the contact changes
    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true); // Show loading state
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error.message);
            } else {
                const filtered = data.filter(
                    (msg) =>
                        ((msg.sender_id === currentUser.id && msg.receiver_id === contact.id) ||
                            (msg.sender_id === contact.id && msg.receiver_id === currentUser.id)) &&
                        !msg.deleted
                );
                setMessages(filtered);
            }

            setLoading(false); // Hide loading state
        };

        fetchMessages();
    }, [contact.id, currentUser.id]);



    // Realtime subscription to new messages between the current user and selected contact
    // This effect will run whenever the contact changes
    useEffect(() => {
        const channel = supabase
            .channel("chat-messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    const isBetweenCurrentAndContact =
                        ((newMessage.sender_id === currentUser.id && newMessage.receiver_id === contact.id) ||
                            (newMessage.sender_id === contact.id && newMessage.receiver_id === currentUser.id));

                    if (isBetweenCurrentAndContact && !newMessage.deleted) {
                        setMessages((prev) => [...prev, newMessage]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser.id, contact.id]);




    // Function to handle sending a message
    // This function will be called when the user clicks the "Send" button
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const { error } = await supabase.from("messages").insert({
            sender_id: currentUser.id,
            receiver_id: contact.id,
            content: message.trim(),
        });

        if (error) {
            console.error("Error sending message:", error.message);
        } else {
            setMessage(""); // Clear input
        }
    };


    return (
        <motion.div
            className="h-full p-4 flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="border-b pb-2 mb-4">
                <h2 className="text-xl font-semibold">
                    Chat with {contact.username}
                </h2>
            </div>

            {/* Chat History */}
            <div className="flex-1 bg-gray-200 dark:bg-gray-900 rounded p-4 overflow-y-auto space-y-4">
                {loading ? (
                    <motion.div
                        className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        Loading messages...
                    </motion.div>
                ) : messages.length === 0 ? (
                    <motion.div
                        className="flex flex-col items-center justify-center h-full"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <PackageOpen className="w-16 h-16 text-gray-500 dark:text-gray-400 mb-4" />
                        </motion.div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                            Message History empty
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center mt-4 text-lg">
                            Start a Chat now with {contact.username}
                        </div>
                    </motion.div>
                ) : (
                    messages.map((msg) => {
                        const isSentByCurrentUser = msg.sender_id === currentUser.id;
                        const timestamp = new Date(msg.created_at);
                        const formattedDate = timestamp.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });
                        const formattedTime = timestamp.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className={`flex flex-col ${isSentByCurrentUser ? "items-end" : "items-start"}`}
                            >
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {formattedDate} at {formattedTime}
                                </span>
                                <div
                                    className={`relative max-w-[70%] min-w-[200px] p-3 rounded-lg shadow ${isSentByCurrentUser
                                        ? "bg-blue-600 text-white self-end rounded-br-none"
                                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white self-start rounded-bl-none"
                                        }`}
                                >
                                    {msg.content}
                                    {isSentByCurrentUser && (
                                        <div className="absolute bottom-1 right-2">
                                            <CheckCheck className="w-4 h-4 text-white opacity-70" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>


            {/* Input Area */}
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 p-2 rounded border dark:bg-gray-900 dark:text-white"
                    placeholder="Type a message..."
                />
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                >
                    Send
                </button>
            </div>
        </motion.div>
    );
};

export default ChatWindow;
