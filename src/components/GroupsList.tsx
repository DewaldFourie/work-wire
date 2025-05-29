import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCheck } from "lucide-react";
import { formatMessageDate } from "../utils/date";
import { IconUsersPlus } from '@tabler/icons-react';
import CreateGroupModal from "./CreateGroupModal";

type Group = {
    id: string;
    name: string;
};

type GroupWithLastMessage = Group & {
    last_message_time: string | null;
    last_message_text: string | null;
    last_message_sender_id: string | null;
    last_message_sender_username?: string | null;
};

type Props = {
    currentUserId: string;
    onSelectGroup: (group: Group | null) => void;
    selectedGroupId: string | null;
};

const GroupsList = ({ currentUserId, onSelectGroup, selectedGroupId }: Props) => {
    const [groups, setGroups] = useState<GroupWithLastMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            const { data: memData, error: memErr } = await supabase
                .from("group_members")
                .select("group_id")
                .eq("user_id", currentUserId);
            if (memErr) { console.error(memErr); setLoading(false); return; }

            const memberships = memData || [];
            if (memberships.length === 0) {
                setGroups([]); setLoading(false); return;
            }

            const groupIds = memberships.map(m => m.group_id);
            const { data: grpData, error: grpErr } = await supabase
                .from("groups")
                .select("id, name")
                .in("id", groupIds);
            if (grpErr) { console.error(grpErr); setLoading(false); return; }

            // fetch last message for each group
            const withMsgs = await Promise.all(
                (grpData || []).map(async group => {
                    const { data: msgData } = await supabase
                        .from("messages")
                        .select("created_at, content, sender_id")
                        .eq("group_id", group.id)
                        .eq("deleted", false)
                        .order("created_at", { ascending: false })
                        .limit(1);

                    const last = msgData?.[0] || null;
                    let senderUsername: string | null = null;
                    if (last?.sender_id) {
                        const { data: u } = await supabase
                            .from("users")
                            .select("username")
                            .eq("id", last.sender_id)
                            .single();
                        senderUsername = u?.username || null;
                    }

                    return {
                        ...group,
                        last_message_time: last?.created_at ?? null,
                        last_message_text: last?.content ?? null,
                        last_message_sender_id: last?.sender_id ?? null,
                        last_message_sender_username: senderUsername,
                    } as GroupWithLastMessage;
                })
            );

            withMsgs.sort((a, b) => {
                if (!a.last_message_time) return 1;
                if (!b.last_message_time) return -1;
                return (
                    new Date(b.last_message_time).getTime() -
                    new Date(a.last_message_time).getTime()
                );
            });

            setGroups(withMsgs);
            setLoading(false);
        };

        fetchGroups();
    }, [currentUserId]);

    useEffect(() => {
        const channel = supabase
            .channel("group-messages-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                async ({ new: newMsg }) => {
                    if (!newMsg.group_id) return;

                    // update last message in state
                    setGroups(prev => {
                        const idx = prev.findIndex(g => g.id === newMsg.group_id);
                        if (idx === -1) return prev;
                        const updated = [...prev];
                        updated[idx] = {
                            ...updated[idx],
                            last_message_time: newMsg.created_at,
                            last_message_text: newMsg.content,
                            last_message_sender_id: newMsg.sender_id,
                        };
                        return updated.sort((a, b) => {
                            if (!a.last_message_time) return 1;
                            if (!b.last_message_time) return -1;
                            return (
                                new Date(b.last_message_time).getTime() -
                                new Date(a.last_message_time).getTime()
                            );
                        });
                    });

                    // fetch/update sender username
                    const { data: userData } = await supabase
                        .from("users")
                        .select("username")
                        .eq("id", newMsg.sender_id)
                        .single();
                    if (userData?.username) {
                        setGroups(prev =>
                            prev.map(g =>
                                g.id === newMsg.group_id
                                    ? { ...g, last_message_sender_username: userData.username }
                                    : g
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    return (
        <motion.div
            className="p-4 min-h-full flex flex-col space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* ─── HEADER ───────────────────── */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-4">
                    <Users className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    Groups
                </h2>
                <hr className="border-t border-gray-300 dark:border-gray-700" />
            </div>

            {/* ─── BELOW HEADER: CONDITIONAL ─── */}
            <div className="flex-1 relative">
                <AnimatePresence>
                {showCreateModal ? (
                    <div className="absolute inset-0">
                        <CreateGroupModal
                            onClose={() => setShowCreateModal(false)}
                            currentUserId={currentUserId}
                        />
                    </div>
                
                ) : (
                    <>
                        {/* Create Button */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={() => {
                                    onSelectGroup(null);
                                    setShowCreateModal(true);
                                }}
                                className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                            >
                                <IconUsersPlus className="w-5 h-5" />
                                Create New Group
                            </button>
                        </div>

                        {/* Group List */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-3 mt-36 text-gray-700 dark:text-gray-300">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500" />
                                    <p className="text-base font-medium">Loading groups...</p>
                                </div>
                            ) : groups.length === 0 ? (
                                <div className="text-gray-500 dark:text-gray-400">
                                    You are not a member of any groups.
                                </div>
                            ) : (
                                <ul className="space-y-2 max-h-[calc(100vh-200px)]">
                                    {groups.map((group) => {
                                        const isActive = group.id === selectedGroupId;
                                        const isSentByCurrentUser =
                                            group.last_message_sender_id === currentUserId;
                                        const messagePrefix = isSentByCurrentUser
                                            ? "You: "
                                            : group.last_message_sender_username
                                                ? `${group.last_message_sender_username}: `
                                                : "";
                                        return (
                                            <motion.li
                                                key={group.id}
                                                initial={{ opacity: 0, y: 0 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                onClick={() => onSelectGroup(group)}
                                                className={`p-3 rounded-lg cursor-pointer transition ${isActive
                                                        ? "bg-blue-100 dark:bg-blue-900 border-l-2 border-blue-500"
                                                        : "bg-gray-200 dark:bg-gray-900"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate w-40">
                                                        {group.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                                        {group.last_message_time
                                                            ? formatMessageDate(group.last_message_time)
                                                            : ""}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate w-60">
                                                        {group.last_message_text ? (
                                                            `${messagePrefix}${group.last_message_text}`
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
                                            </motion.li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default GroupsList;
