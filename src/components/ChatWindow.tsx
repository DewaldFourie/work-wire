
import { useState, useEffect } from "react";
import type { UserProfile } from "../types";
import { supabase } from "../supabase/client";
import type { Message } from "../types";
import { CheckCheck, PackageOpen, ChevronDown, Trash2, SendHorizontal, SmilePlus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData, Theme } from 'emoji-picker-react';
import { formatMessageDateTime } from "../utils/date";


type Props = {
    contact: UserProfile;
    currentUser: UserProfile;
    onClose: () => void;
};



const ChatWindow = ({ contact, currentUser, onClose }: Props) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [dropdownVisibleId, setDropdownVisibleId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);


    // Fetch messages when the component mounts or when the contact changes
    // This effect will run whenever the contact changes
    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true); // Show loading state
            setShowEmojiPicker(false); // Hide emoji picker if open
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


    // Scroll to the bottom of the chat window when new messages are added
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Close emoji picker when clicking outside of it
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowEmojiPicker(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);


    useEffect(() => {
        const channel = supabase.channel("presence:online-users", {
            config: {
                presence: { key: currentUser.id },
            },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const onlineIds = Object.keys(state);
                setOnlineUserIds(onlineIds);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({});
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [currentUser.id]);

    const isOnline = onlineUserIds.includes(contact.id);

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

    // function to handle soft delete of a message
    // This function will be called when the user clicks the "Delete" button
    const handleDeleteMessage = async (messageId: string) => {

        const { error } = await supabase
            .from("messages")
            .update({ deleted: true })
            .eq("id", messageId);

        if (error) {
            console.error("Error deleting message:", error.message);
        } else {
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== messageId)
            );
        }
    };


    // Function to handle emoji picker toggle
    // This function will be called when the user clicks the emoji button
    const handleEmojiSelect = (emojiData: EmojiClickData) => {
        setMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };


    return (
        <motion.div
            className="h-full p-4 flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Header */}
            <motion.div
                key={contact.id} // Ensure smooth animation per contact switch
                initial={{ opacity: 0, }}
                animate={{ opacity: 1, }}
                exit={{ opacity: 0, }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-between  pb-2 mb-2 px-2 sm:px-0"
            >
                {/* Left: Avatar + Info */}
                <div className="flex items-center space-x-4">
                    <div className="relative w-10 h-10">
                        <img
                            src={contact.profile_image_url || "/default-image.jpg"}
                            alt={`${contact.username}'s profile`}
                            className="w-full h-full object-cover rounded-full "
                        />
                        <span
                            className={`absolute inset-0 rounded-full ring-2 ring-offset-2 shadow-md 
                                            ${isOnline
                                    ? "ring-green-500 ring-offset-white dark:ring-offset-gray-900"
                                    : "ring-gray-300 dark:ring-gray-500 ring-offset-white dark:ring-offset-gray-900"
                                }`}
                        ></span>
                    </div>
                    <div>
                        <h2
                            className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            onClick={() => { }}
                        >
                            {contact.username}
                        </h2>
                        <p
                            className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer"
                            onClick={() => { }}
                        >
                            {contact.email}
                        </p>
                    </div>
                </div>

                {/* Right: Close Button */}
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X size={20} />
                </button>
            </motion.div>
            <hr className="border-gray-300 dark:border-gray-600 mb-3" />
            {/* Chat History */}
            <div className="flex-1 bg-gray-200 dark:bg-gray-900 rounded p-4 overflow-y-auto overflow-x-hidden space-y-4 pb-[100px]">
                {loading ? (
                    <motion.div
                        className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 "
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
                        const formattedDate = formatMessageDateTime(msg.created_at);

                        return (
                            <motion.div
                                key={msg.id}
                                onMouseEnter={() => setHoveredMessageId(msg.id)}
                                onMouseLeave={() => {
                                    setHoveredMessageId(null);
                                    setDropdownVisibleId(null);
                                }}
                                className={`relative flex flex-col ${isSentByCurrentUser ? "items-end" : "items-start"}`}
                            >
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2 mr-2">
                                    {formattedDate}
                                </span>
                                <div
                                    className={`relative max-w-[70%] min-w-[200px] p-3 rounded-2xl backdrop-blur-sm bg-opacity-90 break-words break-all whitespace-pre-wrap transition-shadow duration-300 ${isSentByCurrentUser
                                        ? "bg-blue-600 text-white self-end rounded-br-none shadow-[0_6px_12px_rgba(0,0,0,0.25)] dark:shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                                        : "bg-white text-gray-900 self-start rounded-bl-none shadow-[0_6px_12px_rgba(0,0,0,0.1)] dark:bg-gray-800 dark:text-white dark:shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                                        }`}
                                >
                                    {msg.content}
                                    {isSentByCurrentUser && (
                                        <div
                                            className="absolute bottom-1 right-2 cursor-pointer"
                                            onClick={() =>
                                                setDropdownVisibleId(dropdownVisibleId === msg.id ? null : msg.id)
                                            }
                                        >
                                            {hoveredMessageId === msg.id ? (
                                                <ChevronDown className="w-4 h-4 text-white opacity-70" />
                                            ) : (
                                                <CheckCheck className="w-4 h-4 text-white opacity-70" />
                                            )}
                                        </div>
                                    )}

                                    {/* Mini Dropdown */}
                                    {dropdownVisibleId === msg.id && (
                                        <div className="absolute z-10 top-full right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-700 rounded shadow py-1 px-2 text-sm"
                                            onMouseEnter={() => setHoveredMessageId(msg.id)}
                                            onMouseLeave={() => {
                                                setDropdownVisibleId(null);
                                                setHoveredMessageId(null);
                                            }}
                                        >
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                {messages.length > 0 && <div ref={bottomRef} />}
            </div>
            {/* Input Area */}
            <div className="mt-4 flex gap-2 items-center relative">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-full mb-4 left-0 z-50">
                        <EmojiPicker
                            onEmojiClick={handleEmojiSelect}
                            theme={document.documentElement.classList.contains("dark") ? "dark" as Theme : "light" as Theme}

                        />
                    </div>
                )}

                {/* Input + Send */}
                <div className="relative flex-1">
                    {/* Emoji Button */}
                    <button
                        onClick={() => setShowEmojiPicker(prev => !prev)}
                        className="absolute text-2xl top-1/2 -translate-y-1/2 left-3  hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                        <SmilePlus />
                    </button>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full py-3 pr-20 pl-14 rounded ring-1 ring-blue-500 focus:ring-2 focus:outline-none focus:ring-blue-500 dark:ring-blue-800 dark:focus:ring-blue-800 dark:bg-gray-900 dark:text-white text-lg "
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:text-blue-300 hover:cursor-pointer"
                    >
                        <SendHorizontal size={24} className="mr-2" />
                    </button>
                </div>
            </div>

        </motion.div>
    );
};

export default ChatWindow;
