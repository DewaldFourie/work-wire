import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase/client";

type Props = {
    onClose: () => void;
    currentUserId: string;
};

type User = {
    id: string;
    username: string;
};

const CreateGroupModal = ({ onClose, currentUserId }: Props) => {
    const [groupName, setGroupName] = useState("");
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch contacts once
    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await supabase
                .from("users")
                .select("id, username")
                .neq("id", currentUserId)
                .order("username", { ascending: true });
            if (data) setAllUsers(data);
        };
        fetchUsers();
        setSelectedUsers([{ id: currentUserId, username: "You" }]);
    }, [currentUserId]);

    const addUser = (user: User) => {
        if (!selectedUsers.find((u) => u.id === user.id)) {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    const removeUser = (userId: string) => {
        if (userId === currentUserId) return;
        setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const handleCreate = async () => {
        setError(null);
        if (!groupName.trim()) {
            setError("Please enter a group name.");
            return;
        }
        setSubmitting(true);

        // uniqueness check
        const { data: exists } = await supabase
            .from("groups")
            .select("id")
            .eq("name", groupName.trim())
            .limit(1)
            .single();

        if (exists) {
            setError("A group with that name already exists.");
            setSubmitting(false);
            return;
        }

        try {
            const { data: groupData, error: groupError } = await supabase
                .from("groups")
                .insert([{ name: groupName.trim(), created_by: currentUserId }])
                .select()
                .single();
            if (groupError) throw groupError;

            const members = selectedUsers.map((u) => ({
                group_id: groupData.id,
                user_id: u.id,
            }));
            const { error: membersError } = await supabase
                .from("group_members")
                .insert(members);
            if (membersError) throw membersError;

            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to create group. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 flex flex-col"
        >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Create New Group
            </h2>

            {error && (
                <p className="text-sm text-red-500 mb-2">
                    {error}
                </p>
            )}

            <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2  rounded-md bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white mb-6"
            />

            {/* Members Selection */}
            <div className="mb-4">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">
                    Add Members
                </label>
                <div className=" rounded-md bg-gray-100 dark:bg-gray-900 h-60 overflow-y-auto mb-6">
                    {allUsers.length === 0 ? (
                        <p className="p-2 text-gray-500 dark:text-gray-400">
                            No users found
                        </p>
                    ) : (
                        allUsers.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => addUser(user)}
                                disabled={selectedUsers.some((u) => u.id === user.id)}
                                className={`w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-700 ${selectedUsers.some((u) => u.id === user.id)
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                            >
                                {user.username}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Selected Members (now scrollable) */}
            <div className="mb-4">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">
                    Selected Members
                </label>
                <div className=" rounded-md bg-white dark:bg-gray-800 max-h-60 overflow-y-auto p-2 flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center bg-gray-200 text-black dark:bg-gray-900 dark:text-white  px-3 py-1 rounded-full"
                        >
                            <span>{user.id === currentUserId ? "You" : user.username}</span>
                            {user.id !== currentUserId && (
                                <button
                                    onClick={() => removeUser(user.id)}
                                    className="ml-2 text-red-500"
                                    aria-label={`Remove ${user.username}`}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-auto">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreate}
                    disabled={!groupName.trim() || submitting}
                    className="px-4 py-2 rounded-md text-white
            bg-blue-600 hover:bg-blue-700
            disabled:bg-blue-400"
                >
                    {submitting ? "Creating…" : "Create"}
                </button>
            </div>
        </motion.div>
    );
};

export default CreateGroupModal;
