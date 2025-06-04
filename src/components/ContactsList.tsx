import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import type { UserProfile } from "../types";
import { User, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { formatMessageDate } from "../utils/date";
import { useSound } from '../contexts/use-sound';

type Props = {
    currentUserId: string;
    onSelectContact: (user: UserProfile) => void;
    selectedContactId: string | null;
};

type ContactWithLastMessage = UserProfile & {
    last_message_time: string | null;
    last_message_text: string | null;
    last_message_sender_id: string | null;
    last_message_image_url: string | null;
    is_unread: boolean;
};

const ContactsList = ({ currentUserId, onSelectContact, selectedContactId }: Props) => {
    const [contacts, setContacts] = useState<ContactWithLastMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { isMuted } = useSound();

    // Fetch contacts and their last message timestamps
    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);

            // 1) Fetch all read timestamps for current user
            const { data: readRows, error: readErr } = await supabase
                .from("message_reads")
                .select("contact_id, last_read_at")
                .eq("user_id", currentUserId);

            if (readErr) {
                console.error("Error fetching read timestamps:", readErr.message);
                // proceed—treat missing reads as “unread”
            }

            // Build a map: contact_id → last_read_at
            const readMap = new Map<string, string>();
            readRows?.forEach((row) => {
                readMap.set(row.contact_id, row.last_read_at);
            });

            // 2) Fetch all users except current
            const { data: usersData, error: userErr } = await supabase
                .from("users")
                .select("*")
                .neq("id", currentUserId);

            if (userErr) {
                console.error("Error fetching contacts:", userErr.message);
                setLoading(false);
                return;
            }

            // 3) For each contact, fetch their last message and compute unread
            const contactsWithTimestamps: ContactWithLastMessage[] = await Promise.all(
                (usersData as UserProfile[]).map(async (contact) => {
                    // Fetch last message between currentUserId and this contact
                    const { data: messages, error: msgErr } = await supabase
                        .from("messages")
                        .select("created_at, content, sender_id, image_url")
                        .eq("deleted", false)
                        .or(
                            `and(sender_id.eq.${currentUserId},receiver_id.eq.${contact.id}),` +
                            `and(sender_id.eq.${contact.id},receiver_id.eq.${currentUserId})`
                        )
                        .order("created_at", { ascending: false })
                        .limit(1);

                    if (msgErr) {
                        console.error(
                            `Error fetching last message for ${contact.username}:`,
                            msgErr.message
                        );
                    }

                    const lastMessage = messages?.[0] ?? null;
                    const lastReadAt = readMap.get(contact.id) || null;

                    // Determine unread: only if last message is from contact, and is newer than lastReadAt
                    const is_unread =
                        lastMessage &&
                        lastMessage.sender_id !== currentUserId &&
                        (!lastReadAt ||
                            new Date(lastMessage.created_at) > new Date(lastReadAt));

                    return {
                        ...contact,
                        last_message_time: lastMessage?.created_at ?? null,
                        last_message_text: lastMessage?.content ?? null,
                        last_message_sender_id: lastMessage?.sender_id ?? null,
                        last_message_image_url: lastMessage?.image_url ?? null,
                        is_unread: Boolean(is_unread),
                    };
                })
            );

            // 4) Sort by last_message_time descending
            contactsWithTimestamps.sort((a, b) => {
                if (!a.last_message_time) return 1;
                if (!b.last_message_time) return -1;
                return (
                    new Date(b.last_message_time).getTime() -
                    new Date(a.last_message_time).getTime()
                );
            });

            setContacts(contactsWithTimestamps);
            setLoading(false);
        };

        fetchContacts();
    }, [currentUserId]);


    // Subscribe to presence updates
    // This will track the online status of users
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

    // Subscribe to new messages in real-time
    // This will update the contacts list when a new message is sent or received
    useEffect(() => {

        const channel = supabase
            .channel("messages-realtime")
            // Listen for new messages
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMsg = payload.new;

                    if (newMsg.sender_id === currentUserId) return;

                    if (newMsg.receiver_id === currentUserId) {
                        if (!isMuted) {
                            const audio = new Audio("/sounds/alert.mp3");
                            audio.play().catch((err) => {
                                console.warn("Notification sound could not be played:", err);
                            });
                        }

                        setContacts((prevContacts) => {
                            const contactId = newMsg.sender_id!;
                            const updated = prevContacts.map((contact) =>
                                contact.id === contactId
                                    ? {
                                        ...contact,
                                        last_message_time: newMsg.created_at,
                                        last_message_text: newMsg.content,
                                        last_message_sender_id: newMsg.sender_id,
                                        last_message_image_url: newMsg.image_url,
                                        is_unread: true,
                                    }
                                    : contact
                            );

                            updated.sort((a, b) => {
                                if (!a.last_message_time) return 1;
                                if (!b.last_message_time) return -1;
                                return (
                                    new Date(b.last_message_time).getTime() -
                                    new Date(a.last_message_time).getTime()
                                );
                            });

                            return [...updated];
                        });
                    }
                }
            )

            // Listen for soft deletes (updates where `deleted` = true)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: "deleted=eq.true", // only updates where deleted=true
                },
                (payload) => {
                    const updatedMsg = payload.new;

                    // Only update if this message was the last message for a contact
                    setContacts((prevContacts) => {
                        const updated = prevContacts.map((contact) => {
                            const isLastMessage =
                                contact.last_message_sender_id === updatedMsg.sender_id &&
                                contact.last_message_time === updatedMsg.created_at;

                            if (isLastMessage) {
                                return {
                                    ...contact,
                                    last_message_text: "[message deleted]",
                                    last_message_image_url: null,
                                };
                            }

                            return contact;
                        });

                        return [...updated];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, isMuted]);


    // Handle contact selection
    // This function is called when a contact is clicked
    const handleSelect = async (contact: UserProfile) => {
        // 1) Upsert “read” timestamp
        await supabase
            .from("message_reads")
            .upsert(
                { user_id: currentUserId, contact_id: contact.id, last_read_at: new Date().toISOString() },
                { onConflict: "user_id,contact_id" }
            );


        // 2) Immediately clear the unread flag for UI
        setContacts((prev) =>
            prev.map((c) =>
                c.id === contact.id ? { ...c, is_unread: false } : c
            )
        );

        // 3) Trigger parent selection (show chat)
        onSelectContact(contact);
    };


    return (
        <motion.div
            className="p-4 space-y-2 min-h-full min-w-[100px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <h2 className="text-xl font-semibold flex items-center gap-4">
                <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                Contacts
            </h2>
            <hr className="border-t border-gray-300 dark:border-gray-700 mb-4" />
            <input
                type="text"
                placeholder="Search Contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[97%] px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 mt-36 text-gray-700 dark:text-gray-300">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500" />
                    <p className="text-base font-medium">Loading contacts...</p>
                </div>
            ) : contacts.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No other users found.</div>
            ) : (
                <ul className="space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
                    {contacts
                        .filter(contact =>
                            contact.username.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((contact) => {
                            const isActive = contact.id === selectedContactId;
                            const isSentByCurrentUser = contact.last_message_sender_id === currentUserId;
                            const messagePrefix = isSentByCurrentUser ? "You: " : "";
                            const isOnline = onlineUserIds.includes(contact.id);

                            return (
                                <motion.li
                                    key={contact.id}
                                    initial={{ opacity: 0, y: 0 }}
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
                                            <div
                                                className={`font-medium truncate w-40 ${contact.is_unread
                                                    ? "text-gray-900 dark:text-white font-semibold"
                                                    : "text-gray-900 dark:text-white"
                                                    }`}
                                            >
                                                {contact.username}
                                            </div>
                                            <div className="flex items-center">
                                                {contact.is_unread && (
                                                    <motion.div
                                                        className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-1">
                                                    {contact.last_message_time
                                                        ? formatMessageDate(contact.last_message_time)
                                                        : ""}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Bottom row: message + check icon */}
                                        <div className="flex justify-between items-center mt-1">
                                            <div
                                                className={`text-sm truncate w-40 ${contact.is_unread
                                                    ? "text-gray-800 dark:text-gray-300 font-semibold"
                                                    : "text-gray-600 dark:text-gray-400"
                                                    }`}
                                            >
                                                {contact.last_message_image_url ? (
                                                    <span className="italic text-xs text-gray-500 dark:text-gray-400">Image</span>
                                                ) : contact.last_message_text ? (
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
