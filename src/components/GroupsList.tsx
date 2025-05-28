import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

type Group = {
    id: string;
    name: string;
};

type Props = {
    currentUserId: string;
    onSelectGroup: (group: Group) => void;
    selectedGroupId: string | null;
};

const GroupsList = ({ currentUserId, onSelectGroup, selectedGroupId }: Props) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);

            // 1) Fetch memberships (just group_id)
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

            const ids = memberships.map((m) => m.group_id);

            // 2) Fetch groups by those IDs
            const { data: grpData, error: grpErr } = await supabase
                .from("groups")
                .select("id, name")
                .in("id", ids);

            if (grpErr) {
                console.error("Error fetching groups:", grpErr.message);
                setLoading(false);
                return;
            }

            const fetched = (grpData as Group[]) || [];
            setGroups(fetched);
            setLoading(false);
        };

        fetchGroups();
    }, [currentUserId]);

    return (
        <motion.div
            className="p-4 space-y-2 min-h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <h2 className="text-xl font-semibold flex items-center gap-4">
                <Users className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                Groups
            </h2>
            <hr className="border-t border-gray-300 dark:border-gray-700 mb-4" />

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
                <ul className="space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
                    {groups.map((group) => {
                        const isActive = group.id === selectedGroupId;
                        return (
                            <motion.li
                                key={group.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => onSelectGroup(group)}
                                className={`p-3 rounded-lg cursor-pointer transition text-gray-900 dark:text-white truncate ${isActive
                                        ? "bg-blue-100 dark:bg-blue-900 border-l-2 border-blue-500"
                                        : "bg-gray-200 dark:bg-gray-900"
                                    }`}
                            >
                                {group.name}
                            </motion.li>
                        );
                    })}
                </ul>
            )}
        </motion.div>
    );
};

export default GroupsList;
