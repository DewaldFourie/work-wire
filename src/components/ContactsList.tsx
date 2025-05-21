import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import type { UserProfile } from "../types";

type Props = {
    currentUserId: string;
    onSelectContact: (user: UserProfile) => void;
};

const ContactsList = ({ currentUserId, onSelectContact }: Props) => {
    const [contacts, setContacts] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .neq("id", currentUserId);

            if (error) {
                console.error("Error fetching contacts:", error.message);
            } else if (data) {
                setContacts(data as UserProfile[]);
            }

            setLoading(false);
        };

        fetchContacts();
    }, [currentUserId]);

    if (loading) {
        return <div className="p-4 text-gray-500">Loading contacts...</div>;
    }

    return (
        <div className="p-4 space-y-2">
            <h2 className="text-xl font-semibold mb-4">Contacts</h2>
            {contacts.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No other users found.</div>
            ) : (
                <ul className="space-y-2">
                    {contacts.map((contact) => (
                        <li
                            key={contact.id}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            onClick={() => onSelectContact(contact)}
                        >
                            <img
                                src={contact.profile_image_url || "/default-image.jpg"}
                                alt={`${contact.username}'s profile`}
                                className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                            />
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {contact.username}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {contact.email}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ContactsList;
