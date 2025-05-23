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
			<div className="flex items-center justify-center h-screen">
				<p className="text-gray-500">Loading your profile...</p>
			</div>
		);
	}

	return (
		<div className="flex h-full ">
			{/* Left Sidebar: Contacts List */}
			<div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
				<ContactsList currentUserId={user.id} onSelectContact={setSelectedContact} />
			</div>

			{/* Right Container: Chat or Welcome */}
			<div className="flex-1">
				{selectedContact ? (
					<ChatWindow contact={selectedContact} currentUser={currentUserProfile} />
				) : (
					<Welcome />
				)}
			</div>
		</div>
	);
};

export default Home;
