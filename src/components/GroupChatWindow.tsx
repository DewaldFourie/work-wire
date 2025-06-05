import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import type { UserProfile, Message } from "../types";
import {
    X,
    SendHorizontal,
    ChevronUp,
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

            // 👇 Clear previous state so stale data doesn't persist
            setMessages([]);
            setProfiles({});

            // 1. Load messages
            const { data: raw, error: err } = await supabase
                .from("messages")
                .select("*")
                .eq("group_id", group.id)
                .eq("is_group_message", true)
                .eq("deleted", false)
                .order("created_at", { ascending: true });

            if (err) {
                console.error(err.message);
            } else {
                setMessages((raw as Message[]) || []);
            }

            // 2. Fetch group members
            const { data: memberIds, error: mErr } = await supabase
                .from("group_members")
                .select("user_id")
                .eq("group_id", group.id);

            if (mErr) {
                console.error("Failed to fetch group member IDs:", mErr.message);
            } else {
                const ids = (memberIds || []).map((m) => m.user_id);

                if (ids.length > 0) {
                    const { data: users, error: uErr } = await supabase
                        .from("users")
                        .select("id, username, profile_image_url")
                        .in("id", ids);

                    if (uErr) {
                        console.error("Failed to fetch user profiles:", uErr.message);
                    } else {
                        const newProfiles: Record<string, UserProfile> = {};
                        (users as UserProfile[]).forEach((u) => {
                            newProfiles[u.id] = u;
                        });
                        setProfiles(newProfiles); // 👈 overwrite instead of merging
                    }
                }
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
        const timeout = setTimeout(() => {
            if (bottomRef.current) {
                bottomRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 500); // 100ms delay

        return () => clearTimeout(timeout);
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
                {/* Left: Group Name + Member Avatars */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-10 overflow-hidden">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                        {group.name}
                    </h2>
                    {/* Member list: scrollable if overflow */}
                    <div className="flex items-center gap-2 overflow-x-auto max-w-[45vw] scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-2 px-1 mr-4">
                        {Object.values(profiles).map((user) => (
                            <div className="flex items-center gap-1 flex-shrink-0" key={user.id}>
                                <img
                                    src={user.profile_image_url || "/default-image.jpg"}
                                    alt={user.username}
                                    title={user.username}
                                    className="w-6 h-6  rounded-full border border-gray-500 dark:border-gray-700 hover:border-blue-400 hover:ring-2 hover:ring-blue-400 cursor-pointer"
                                    onClick={() => goProfile(user.id)}
                                />
                                <span className="text-xs truncate max-w-[6rem]">{user.username}</span>
                            </div>
                        ))}
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

            {/* Messages */}
            <div className="flex-1 bg-gray-200 dark:bg-gray-900 rounded p-4 overflow-y-auto overflow-x-hidden space-y-4 pb-[100px]">
                {loading ? (
                    <motion.div
                        className="flex flex-col items-center justify-center h-full  text-gray-700 dark:text-gray-300"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500" />
                        <p className="text-base font-medium">Loading messages...</p>
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
                                                <ChevronUp className="w-4 h-4 text-white opacity-70" />
                                            ) : (
                                                <CheckCheck className="w-4 h-4 text-white opacity-70" />
                                            )}
                                        </div>
                                    )}

                                    {dropdownFor === msg.id && (
                                        <div
                                            className="absolute z-10 bottom-3 right-0 mb-2 rounded shadow py-1 px-2 text-sm bg-transparent"
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
