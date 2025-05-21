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
                contacts.map((contact) => (
                    <div
                        key={contact.id}
                        className="cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => onSelectContact(contact)}
                    >
                        <div className="font-medium">{contact.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ContactsList;
