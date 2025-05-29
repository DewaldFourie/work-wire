import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { motion } from "framer-motion";
import { Users, CheckCheck } from "lucide-react";
import { formatMessageDate } from "../utils/date";
import { IconUsersPlus } from '@tabler/icons-react';

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
    onSelectGroup: (group: Group) => void;
    selectedGroupId: string | null;
};

const GroupsList = ({ currentUserId, onSelectGroup, selectedGroupId }: Props) => {
    const [groups, setGroups] = useState<GroupWithLastMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);

            const { data: memData, error: memErr } = await supabase
                .from("group_members")
                .select("group_id")
                .eq("user_id", currentUserId);

            if (memErr) {
                console.error("Error fetching memberships:", memErr.message);
                setLoading(false);
                return;
            }

            const memberships = (memData as { group_id: string; }[]) || [];
            if (memberships.length === 0) {
                setGroups([]);
                setLoading(false);
                return;
            }

            const groupIds = memberships.map((m) => m.group_id);

            const { data: grpData, error: grpErr } = await supabase
                .from("groups")
                .select("id, name, created_by, created_at")
                .in("id", groupIds);

            if (grpErr) {
                console.error("Error fetching groups:", grpErr.message);
                setLoading(false);
                return;
            }

            const baseGroups = (grpData as Group[]) || [];

            const groupsWithMessages: GroupWithLastMessage[] = await Promise.all(
                baseGroups.map(async (group) => {
                    const { data: msgData, error: msgErr } = await supabase
                        .from("messages")
                        .select("created_at, content, sender_id")
                        .eq("group_id", group.id)
                        .eq("deleted", false)
                        .order("created_at", { ascending: false })
                        .limit(1);

                    if (msgErr) {
                        console.error(`Error fetching last message for group ${group.name}:`, msgErr.message);
                    }

                    const lastMsg = msgData?.[0];

                    let senderUsername: string | null = null;

                    if (lastMsg?.sender_id) {
                        const { data: userData, error: userErr } = await supabase
                            .from("users")
                            .select("username")
                            .eq("id", lastMsg.sender_id)
                            .single();

                        if (userErr) {
                            console.warn(`Could not fetch sender username for user ${lastMsg.sender_id}:`, userErr.message);
                        } else {
                            senderUsername = userData?.username ?? null;
                        }
                    }

                    return {
                        ...group,
                        last_message_time: lastMsg?.created_at ?? null,
                        last_message_text: lastMsg?.content ?? null,
                        last_message_sender_id: lastMsg?.sender_id ?? null,
                        last_message_sender_username: senderUsername,
                    };
                })
            );


            groupsWithMessages.sort((a, b) => {
                if (!a.last_message_time) return 1;
                if (!b.last_message_time) return -1;
                return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
            });

            setGroups(groupsWithMessages);
            setLoading(false);
        };

        fetchGroups();
    }, [currentUserId]);

    useEffect(() => {
        const channel = supabase.channel('group-messages-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, async (payload) => {
                const newMsg = payload.new;

                // Ignore if message isn't for a group
                if (!newMsg.group_id) return;

                setGroups(prevGroups => {
                    const groupIndex = prevGroups.findIndex(g => g.id === newMsg.group_id);
                    if (groupIndex === -1) {
                        // Not a group the user is part of
                        return prevGroups;
                    }

                    // Update group info
                    const updatedGroups = [...prevGroups];
                    updatedGroups[groupIndex] = {
                        ...updatedGroups[groupIndex],
                        last_message_time: newMsg.created_at,
                        last_message_text: newMsg.content,
                        last_message_sender_id: newMsg.sender_id,
                        // We fetch username async below
                    };

                    // Sort groups
                    updatedGroups.sort((a, b) => {
                        if (!a.last_message_time) return 1;
                        if (!b.last_message_time) return -1;
                        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
                    });

                    return updatedGroups;
                });

                // Fetch username (async outside of setState)
                const { data: userData, error: userErr } = await supabase
                    .from("users")
                    .select("username")
                    .eq("id", newMsg.sender_id)
                    .single();

                if (!userErr && userData?.username) {
                    setGroups(prevGroups => {
                        return prevGroups.map(g => g.id === newMsg.group_id
                            ? { ...g, last_message_sender_username: userData.username }
                            : g
                        );
                    });
                }
            })
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
            {/* Header Section */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-4">
                    <Users className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    Groups
                </h2>
                <hr className="border-t border-gray-300 dark:border-gray-700" />
            </div>

            {/* Create Group Button */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={() => {
                        // Replace with modal or navigation logic
                        console.log("Create Group Clicked");
                    }}
                    className="widrh-full flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
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
                            const isSentByCurrentUser = group.last_message_sender_id === currentUserId;
                            const messagePrefix = isSentByCurrentUser
                                ? "You: "
                                : group.last_message_sender_username
                                    ? `${group.last_message_sender_username}: `
                                    : "";
                            return (
                                <motion.li
                                    key={group.id}
                                    initial={{ opacity: 0, y: 5 }}
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
        </motion.div>
    );

};

export default GroupsList;
