import { useState } from "react";
import type { UserProfile } from "../types";

type Props = {
    contact: UserProfile;
    currentUser: UserProfile;
};

const ChatWindow = ({ contact, currentUser }: Props) => {
    const [message, setMessage] = useState("");

    const handleSendMessage = () => {
        if (!message.trim()) return;

        console.log("Sending message:", message);
        console.log("From:", currentUser.username, "To:", contact.username);

        // TODO: Save message to Supabase here

        setMessage(""); // Clear input after sending
    };

    return (
        <div className="h-full p-4 flex flex-col">
            {/* Header */}
            <div className="border-b pb-2 mb-4">
                <h2 className="text-xl font-semibold">
                    Chat with {contact.username}
                </h2>
            </div>

            {/* Chat History */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-y-auto">
                {/* TODO: Render actual message history here */}
                <div className="text-gray-500 dark:text-gray-400">
                    No messages yet.
                </div>
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
