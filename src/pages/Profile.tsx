import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { supabase } from "../supabase/client";
import { Pencil } from "lucide-react";
import { FaGithub } from "react-icons/fa"; // Font Awesome GitHub icon

import clsx from "clsx";

type UserProfile = {
    id: string;
    username: string;
    email: string;
    profile_image_url: string | null;
    cover_image_url: string | null;
    github_url: string | null;
    location: string | null;
    profession: string | null;
    skills: string | null;
    about: string | null;
};

export default function Profile() {
    const { user } = useAuth();
    const { id } = useParams(); // optional user id for viewing someone else’s profile
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const isOwnProfile = user && user.id === profile?.id;

    useEffect(() => {
        const loadProfile = async () => {
            const profileId = id || user?.id;
            if (!profileId) return;

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", profileId)
                .single();

            if (error) {
                console.error("Error fetching profile:", error.message);
            } else {
                setProfile(data);
            }
        };

        loadProfile();
    }, [id, user?.id]);

    if (!profile) return <div className="text-center mt-20">Loading profile...</div>;

    return (
        <div className="max-w-5xl h-[800px] mx-auto mt-6 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 flex flex-col">
            {/* Cover Image Section - 1/3 */}
            <div className="relative flex-[1.5] bg-gray-300 dark:bg-gray-700">
                {profile.cover_image_url && (
                    <img
                        src={profile.cover_image_url}
                        alt="Cover"
                        className="object-cover w-full h-full"
                    />
                )}
                {isOwnProfile && (
                    <button className="absolute bottom-2 right-4 bg-black bg-opacity-50 p-1 text-white hover:bg-opacity-75 text-sm">
                        Edit Cover Image
                    </button>
                )}
                {/* Profile Picture */}
                <div className="absolute bottom-[-60px] left-10 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white p-1 shadow-md">
                    <img
                        src={profile.profile_image_url || "/default-avatar.png"}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover"
                    />
                    {isOwnProfile && (
                        <div
                            className="absolute right-2 top-[90px] sm:top-[120px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200"
                            onClick={() => {/* trigger file picker */ }}
                        >
                            <Pencil className="text-2xl" />
                        </div>
                    )}
                </div>
            </div>
            {/* Bio Section - 2/3 */}
            <div className="flex-[2.5] p-10 overflow-y-auto">
                <div className="flex items-start gap-2">
                    {/* Profile image spacer */}
                    <div className="w-60 shrink-0" />
                    {/* User details */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-4xl mr-3 font-bold text-gray-900 dark:text-white">{profile.username}</h2>
                            {profile.github_url && (
                                <a
                                    href={profile.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                                    title="GitHub Profile"
                                >
                                    <FaGithub className="w-6 h-6 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white" />
                                </a>
                            )}
                        </div>
                        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                            Profession:{" "}
                            <span className="text-base ml-4 text-gray-700 dark:text-gray-300">
                                {profile.profession || "No profession listed"}
                            </span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Location:{" "}
                            <span className="text-base ml-4 text-gray-700 dark:text-gray-300">
                                {profile.location || "No location provided"}
                            </span>
                        </p>
                    </div>
                    {/* Edit button */}
                    {isOwnProfile && (
                        <button className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            <Pencil size={18} />
                        </button>
                    )}
                </div>
                <hr className="my-6 border-gray-200 dark:border-gray-700" />
                <div className="mt-6 relative ">
                    {/* Edit Button */}
                    {isOwnProfile && (
                        <button
                            className="absolute top-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => {
                                // Edit both Skills and About logic here
                            }}
                            aria-label="Edit Profile Details"
                        >
                            <Pencil size={18} />
                        </button>
                    )}

                    {/* Skills Section */}
                    {profile.skills && profile.skills.trim().length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-xl text-gray-800 dark:text-white">Skills</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.skills.split(",").map((skill, i) => (
                                    <span
                                        key={i}
                                        className="bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded"
                                    >
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* About Me Section */}
                    <div>
                        <h4 className="font-semibold text-3xl text-gray-800 dark:text-white mb-2">
                            About Me
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                            {profile.about || "No bio provided"}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );

}
