import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth-context";
import { supabase } from "../supabase/client";
import ContactsList from "../components/ContactsList";
import ChatWindow from "../components/ChatWindow";
import Welcome from "../components/Welcome";
import type { UserProfile } from "../types";

const Home = () => {
	const { user } = useAuth();
	const [selectedContact, setSelectedContact] = useState<UserProfile | null>(null);
	const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!user?.id) return;

			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error) {
				console.error("Error loading current user profile:", error.message);
			} else {
				setCurrentUserProfile(data as UserProfile);
			}
		};

		fetchProfile();
	}, [user?.id]);

	if (!user || !currentUserProfile) {
		return (
			<div className="flex items-center justify-center h-[99%] p-4 bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-gray-200 via-white to-gray-300 animate-gradientMove">
				{/* Empty for clean minimal look */}
			</div>
		);
	}



	return (
		<div className="flex h-full ">
			{/* Left Sidebar: Contacts List */}
			<div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
				<ContactsList
					currentUserId={user.id}
					onSelectContact={setSelectedContact}
					selectedContactId={selectedContact?.id || null}
				/>
			</div>

			{/* Right Container: Chat or Welcome */}
			<div className="flex-1">
				{selectedContact ? (
					<ChatWindow
						contact={selectedContact}
						currentUser={currentUserProfile}
						onClose={() => setSelectedContact(null)}
					/>
				) : (
					<Welcome contextLabel="contact" />
				)}
			</div>
		</div>
	);
};

export default Home;
