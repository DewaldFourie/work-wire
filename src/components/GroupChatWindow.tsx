import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import type { UserProfile, Message } from "../types";
import {
    X,
    SendHorizontal,
    ChevronDown,
    Trash2,
    CheckCheck,
    PackageOpen,
    SmilePlus,
} from "lucide-react";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData, Theme } from "emoji-picker-react";
import { formatMessageDateTime } from "../utils/date";


type Group = { id: string; name: string; };

type Props = {
    group: Group;
    currentUser: UserProfile;
    onClose: () => void;
};

export default function GroupChatWindow({
    group,
    currentUser,
    onClose,
}: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
    const [messageText, setMessageText] = useState("");
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [dropdownFor, setDropdownFor] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    //Load messages + profiles
    useEffect(() => {
        const load = async () => {
            setLoading(true);

            // Fetch messages by group_id 
            const { data: raw, error: err } = await supabase
                .from("messages")
                .select("*")
                .eq("group_id", group.id)
                .eq("is_group_message", true)
                .eq("deleted", false)
                .order("created_at", { ascending: true });

            if (err) {
                console.error(err.message);
                setMessages([]);
            } else {
                setMessages((raw as Message[]) || []);
            }

            // Fetch distinct other senders
            const otherIds = Array.from(
                new Set(
                    ((raw as Message[]) || [])
                        .map((m) => m.sender_id)
                        .filter((id) => id !== currentUser.id)
                )
            );
            if (otherIds.length) {
                const { data: users, error: uErr } = await supabase
                    .from("users")
                    .select("id, username, profile_image_url")
                    .in("id", otherIds);
                if (uErr) console.error(uErr.message);
                else
                    (users as UserProfile[]).forEach((u) =>
                        setProfiles((p) => ({ ...p, [u.id]: u }))
                    );
            }

            setLoading(false);
        };
        load();
    }, [group.id, currentUser.id]);

    // Realtime subscription on group_id
    // Realtime subscription to new group messages
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

                    // Only accept messages for this group
                    const isThisGroup =
                        newMessage.group_id === group.id &&
                        newMessage.is_group_message;

                    if (isThisGroup) {
                        setMessages((prev) => [...prev, newMessage]);

                        // Load sender profile if needed
                        if (
                            newMessage.sender_id !== currentUser.id &&
                            !profiles[newMessage.sender_id]
                        ) {
                            supabase
                                .from("users")
                                .select("id, username, profile_image_url")
                                .eq("id", newMessage.sender_id)
                                .single()
                                .then((res) => {
                                    if (res.data) {
                                        setProfiles((p) => ({
                                            ...p,
                                            [res.data.id]: res.data,
                                        }));
                                    }
                                });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [group.id, currentUser.id, profiles]);


    // 3) Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 4) Send using group_id
    const send = async () => {
        if (!messageText.trim()) return;
        const { error } = await supabase.from("messages").insert({
            sender_id: currentUser.id,
            group_id: group.id,
            content: messageText.trim(),
            is_group_message: true,
        });
        if (error) console.error(error.message);
        else setMessageText("");
    };

    const selectEmoji = (e: EmojiClickData) => {
        setMessageText((t) => t + e.emoji);
        setShowEmojiPicker(false);
    };

    const goProfile = (id: string) => navigate(`/profile/${id}`);

    return (
        <motion.div
            className="h-full p-4 flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Header */}
            <motion.div
                key={group.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-between pb-2 mb-2 px-2 sm:px-0"
            >
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                    {group.name}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X size={20} />
                </button>
            </motion.div>
            <hr className="border-gray-300 dark:border-gray-600 mb-3" />

            {/* Messages */}
            <div className="flex-1 bg-gray-200 dark:bg-gray-900 rounded p-4 overflow-y-auto overflow-x-hidden space-y-4 pb-[100px]">
                {loading ? (
                    <motion.div
                        className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        Loading messages...
                    </motion.div>
                ) : messages.length === 0 ? (
                    <motion.div
                        className="flex flex-col items-center justify-center h-full"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
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
                            Start a chat in {group.name}
                        </div>
                    </motion.div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id;
                        const formatted = formatMessageDateTime(msg.created_at);

                        return (
                            <motion.div
                                key={msg.id}
                                onMouseEnter={() => setHoveredId(msg.id)}
                                onMouseLeave={() => {
                                    setHoveredId(null);
                                    setDropdownFor(null);
                                }}
                                className={`relative flex flex-col ${isMe ? "items-end" : "items-start"
                                    }`}
                            >
                                <div className="flex gap-2 items-center text-gray-500 dark:text-gray-400 mb-1 ml-2 mr-2">
                                    {!isMe && (
                                        <div className="flex items-center gap-1">
                                            <img
                                                src={profiles[msg.sender_id]?.profile_image_url ?? "/default-image.jpg"}
                                                alt="contact"
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span
                                                onClick={() => goProfile(msg.sender_id)}
                                                className="font-medium text-sm hover:text-blue-600 cursor-pointer"
                                            >
                                                {profiles[msg.sender_id]?.username}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-xs">{formatted}</span>
                                </div>


                                <div
                                    className={`relative max-w-[70%] min-w-[200px] p-3 rounded-2xl backdrop-blur-sm bg-opacity-90 break-words whitespace-pre-wrap transition-shadow duration-300 ${isMe
                                        ? "bg-blue-600 text-white self-end rounded-br-none shadow-[0_6px_12px_rgba(0,0,0,0.25)] dark:shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                                        : "bg-white text-gray-900 self-start rounded-bl-none shadow-[0_6px_12px_rgba(0,0,0,0.1)] dark:bg-gray-800 dark:text-white dark:shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                                        }`}
                                >
                                    {msg.content}
                                    {isMe && (
                                        <div
                                            className="absolute bottom-1 right-2 cursor-pointer"
                                            onClick={() =>
                                                setDropdownFor(dropdownFor === msg.id ? null : msg.id)
                                            }
                                        >
                                            {hoveredId === msg.id ? (
                                                <ChevronDown className="w-4 h-4 text-white opacity-70" />
                                            ) : (
                                                <CheckCheck className="w-4 h-4 text-white opacity-70" />
                                            )}
                                        </div>
                                    )}

                                    {dropdownFor === msg.id && (
                                        <div
                                            className="absolute z-10 top-full right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-700 rounded shadow py-1 px-2 text-sm"
                                            onMouseEnter={() => setHoveredId(msg.id)}
                                            onMouseLeave={() => {
                                                setDropdownFor(null);
                                                setHoveredId(null);
                                            }}
                                        >
                                            <button
                                                onClick={() =>
                                                    supabase
                                                        .from("messages")
                                                        .update({ deleted: true })
                                                        .eq("id", msg.id)
                                                        .then(() =>
                                                            setMessages((m) =>
                                                                m.filter((x) => x.id !== msg.id)
                                                            )
                                                        )
                                                }
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
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="mt-4 flex gap-2 items-center relative">
                {showEmojiPicker && (
                    <div className="absolute bottom-full mb-4 left-0 z-50">
                        <EmojiPicker
                            onEmojiClick={selectEmoji}
                            theme={
                                document.documentElement.classList.contains("dark")
                                    ? ("dark" as Theme)
                                    : ("light" as Theme)
                            }
                        />
                    </div>
                )}

                <div className="relative flex-1">
                    <button
                        onClick={() => setShowEmojiPicker((v) => !v)}
                        className="absolute text-2xl top-1/2 -translate-y-1/2 left-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                        <SmilePlus />
                    </button>
                    <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        className="w-full py-3 pr-20 pl-14 rounded ring-1 ring-blue-500 focus:ring-2 focus:outline-none focus:ring-blue-500 dark:ring-blue-800 dark:focus:ring-blue-800 dark:bg-gray-900 dark:text-white text-lg"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={send}
                        disabled={!messageText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:text-blue-300 hover:cursor-pointer"
                    >
                        <SendHorizontal size={24} className="mr-2" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
