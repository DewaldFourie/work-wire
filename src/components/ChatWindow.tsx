import { useState, useEffect } from "react";
import type { UserProfile } from "../types";
import { supabase } from "../supabase/client";
import type { Message } from "../types";

type Props = {
    contact: UserProfile;
    currentUser: UserProfile;
};

const ChatWindow = ({ contact, currentUser }: Props) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);


    // Function to handle sending a message
    // This function will be called when the user clicks the "Send" button
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const { error } = await supabase.from("messages").insert({
            sender_id: currentUser.id,
            receiver_id: contact.id,
            content: message.trim(),
        });

        if (error) {
            console.error("Error sending message:", error.message);
        } else {
            setMessage(""); // Clear input
        }
    };

    // Fetch messages when the component mounts or when the contact changes
    // This effect will run whenever the contact changes
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error.message);
            } else {
                // Only show messages between the current user and the selected contact
                const filtered = data.filter(
                    (msg) =>
                        ((msg.sender_id === currentUser.id && msg.receiver_id === contact.id) ||
                            (msg.sender_id === contact.id && msg.receiver_id === currentUser.id)) &&
                        !msg.deleted
                );
                setMessages(filtered);
            }
        };

        fetchMessages();
    }, [contact.id, currentUser.id]);


    return (
        <div className="h-full p-4 flex flex-col">
            {/* Header */}
            <div className="border-b pb-2 mb-4">
                <h2 className="text-xl font-semibold">
                    Chat with {contact.username}
                </h2>
            </div>

            {/* Chat History */}           
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-y-auto flex flex-col">
                {messages.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400">No messages yet.</div>
                ) : (
                    <ul className="space-y-2">
                        {messages.map((msg) => (
                            <li
                                key={msg.id}
                                className={`p-2 rounded-lg max-w-xs ${msg.sender_id === currentUser.id
                                        ? "bg-blue-500 text-white self-end"
                                        : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white self-start"
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <p className="text-xs mt-1 text-right opacity-70">
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

            </div>

            {/* Input Area */}
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 p-2 rounded border dark:bg-gray-900 dark:text-white"
                    placeholder="Type a message..."
                />
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
