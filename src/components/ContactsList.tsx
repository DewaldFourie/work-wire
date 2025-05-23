import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import type { UserProfile } from "../types";
import { Users, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { formatMessageDate } from "../utils/date";

type Props = {
    currentUserId: string;
    onSelectContact: (user: UserProfile) => void;
    selectedContactId: string | null;
};

type ContactWithLastMessage = UserProfile & {
    last_message_time: string | null;
    last_message_text: string | null;
    last_message_sender_id: string | null;
};

const ContactsList = ({ currentUserId, onSelectContact, selectedContactId }: Props) => {
    const [contacts, setContacts] = useState<ContactWithLastMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);


    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .neq("id", currentUserId);

            if (error) {
                console.error("Error fetching contacts:", error.message);
                setLoading(false);
                return;
            }

            const contactsWithTimestamps: ContactWithLastMessage[] = await Promise.all(
                (data as UserProfile[]).map(async (contact) => {
                    const { data: messages, error: msgError } = await supabase
                        .from("messages")
                        .select("created_at, content, sender_id")
                        .eq("deleted", false)
                        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${currentUserId})`)
                        .order("created_at", { ascending: false })
                        .limit(1);

                    if (msgError) {
                        console.error(`Error fetching last message for ${contact.username}:`, msgError.message);
                    }

                    const lastMessage = messages?.[0];

                    return {
                        ...contact,
                        last_message_time: lastMessage?.created_at ?? null,
                        last_message_text: lastMessage?.content ?? null,
                        last_message_sender_id: lastMessage?.sender_id ?? null,
                    };
                })
            );

            contactsWithTimestamps.sort((a, b) => {
                if (!a.last_message_time) return 1;
                if (!b.last_message_time) return -1;
                return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
            });

            setContacts(contactsWithTimestamps);
            setLoading(false);
        };

        fetchContacts();
    }, [currentUserId]);


    useEffect(() => {
        const channel = supabase.channel("presence:online-users", {
            config: {
                presence: { key: currentUserId },
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
    }, [currentUserId]);


    // Handle contact selection
    // This function is called when a contact is clicked
    const handleSelect = (contact: UserProfile) => {
        onSelectContact(contact);
    };


    return (
        <motion.div
            className="p-4 space-y-2 min-h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <h2 className="text-xl font-semibold flex items-center gap-4">
                <Users className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                Contacts
            </h2>
            <hr className="border-t border-gray-300 dark:border-gray-700 mb-4" />

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 mt-36 text-gray-700 dark:text-gray-300">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500" />
                    <p className="text-base font-medium">Loading contacts...</p>
                </div>
            ) : contacts.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No other users found.</div>
            ) : (
                <ul className="space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
                    {contacts.map((contact) => {
                        const isActive = contact.id === selectedContactId;
                        const isSentByCurrentUser = contact.last_message_sender_id === currentUserId;
                        const messagePrefix = isSentByCurrentUser ? "You: " : "";
                        const isOnline = onlineUserIds.includes(contact.id);

                        return (
                            <motion.li
                                key={contact.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => handleSelect(contact)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${isActive
                                    ? "bg-blue-100 dark:bg-blue-900 border-l-2 border-blue-500"
                                    : "bg-gray-200 dark:bg-gray-900"
                                    }`}
                            >
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

                                <div className="flex-1 min-w-0">
                                    {/* Top row: username + time */}
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium text-gray-900 dark:text-white truncate w-40">
                                            {contact.username}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                            {contact.last_message_time
                                                ? formatMessageDate(contact.last_message_time)
                                                : ""}
                                        </div>
                                    </div>

                                    {/* Bottom row: message + check icon */}
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate w-40">
                                            {contact.last_message_text ? (
                                                `${messagePrefix}${contact.last_message_text}`
                                            ) : (
                                                <span className="italic text-xs text-gray-500 dark:text-gray-400">
                                                    Start a new conversation...
                                                </span>
                                            )}
                                        </div>
                                        {isSentByCurrentUser && (
                                            <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                </div>
                            </motion.li>
                        );
                    })}
                </ul>
            )}
        </motion.div>
    );
};

export default ContactsList;
