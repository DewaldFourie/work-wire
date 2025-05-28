import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth-context";
import { supabase } from "../supabase/client";
import GroupsList from "../components/GroupsList";
import GroupChatWindow from "../components/GroupChatWindow"; 
import Welcome from "../components/Welcome";
import type { Group, UserProfile } from "../types";

const Groups = () => {
	const { user } = useAuth();
	const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
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
		<div className="flex h-full">
			{/* Left Sidebar: Groups List */}
			<div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
				<GroupsList
					currentUserId={user.id}
					onSelectGroup={setSelectedGroup}
					selectedGroupId={selectedGroup?.id || null}
				/>
			</div>

			{/* Right Container: Group Chat or Welcome */}
			<div className="flex-1">
				{selectedGroup ? (
					<GroupChatWindow
						group={selectedGroup}
						currentUser={currentUserProfile}
						onClose={() => setSelectedGroup(null)}
					/>
				) : (
					<Welcome contextLabel="group"/>
				)}
			</div>
		</div>
	);
};

export default Groups;
