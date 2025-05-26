import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { supabase } from "../supabase/client";
import { Pencil, Camera, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import Modal from "../components/Modal";


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
    const [showProfileImageModal, setShowProfileImageModal] = useState(false);
    const [showCoverImageModal, setShowCoverImageModal] = useState(false);
    const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
    const [showEditSkillsAboutModal, setShowEditSkillsAboutModal] = useState(false);
    const [profession, setProfession] = useState(profile?.profession || "");
    const [location, setLocation] = useState(profile?.location || "");
    const [githubUrl, setGithubUrl] = useState(profile?.github_url || "");
    const [skill1, setSkill1] = useState(profile?.skills?.split(",")[0]?.trim() || "");
    const [skill2, setSkill2] = useState(profile?.skills?.split(",")[1]?.trim() || "");
    const [skill3, setSkill3] = useState(profile?.skills?.split(",")[2]?.trim() || "");
    const [about, setAbout] = useState(profile?.about || '');
    const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
    const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Check if the profile belongs to the logged-in user
    const isOwnProfile = user && user.id === profile?.id;

    const navigate = useNavigate();


    // Fetch the profile data when the component mounts or when the user id changes
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

    // Update the state when the profile changes
    useEffect(() => {
        if (profile) {
            setProfession(profile.profession || "");
            setLocation(profile.location || "");
            setGithubUrl(profile.github_url || "");
            setSkill1(profile.skills?.split(",")[0]?.trim() || "");
            setSkill2(profile.skills?.split(",")[1]?.trim() || "");
            setSkill3(profile.skills?.split(",")[2]?.trim() || "");
            setAbout(profile.about || "");
        }
    }, [profile]);

    // Function to handle the saving of profile details
    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        const updates = {
            profession,
            location,
            github_url: githubUrl,
        };

        const { error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", profile.id);

        if (error) {
            console.error("Failed to update profile details:", error.message);
        } else {
            setProfile({ ...profile, ...updates });
            setShowEditDetailsModal(false);
        }
    };

    // Function to handle the saving of skills and about section
    const handleSaveSkillsAbout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        const skills = [skill1, skill2, skill3].filter(Boolean).join(", ");

        const updates = {
            skills,
            about,
        };

        const { error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", profile.id);

        if (error) {
            console.error("Failed to update skills/about:", error.message);
        } else {
            setProfile({ ...profile, ...updates });
            setShowEditSkillsAboutModal(false);
        }
    };

    // Function to handle the uploading of profile image
    const handleProfileImageUpload = async () => {
        if (!selectedProfileImage || !profile) return;

        setUploading(true);

        // 1. Delete old image if it exists
        if (profile.profile_image_url) {
            const supabaseURLPrefix = import.meta.env.VITE_SUPABASE_STORAGE_URL_PREFIX!;
            const urlPrefix = `${supabaseURLPrefix}avatar/`;
            const fileName = profile.profile_image_url.replace(urlPrefix, '');
            const filePath = `profile/avatar/${fileName}`; // Include the folder here for the remove() call

            const { error: deleteError } = await supabase.storage
                .from('profile-images')
                .remove([filePath]);

            if (deleteError) {
                console.warn("Could not delete old profile image:", deleteError.message);
            }
        }


        // 2. Upload new image
        const fileExt = selectedProfileImage.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `profile/avatar/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(filePath, selectedProfileImage, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error("Upload error:", uploadError.message);
            setUploading(false);
            return;
        }

        // 3. Get new public URL
        const {
            data: { publicUrl },
        } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);

        // 4. Update user record
        const { error: updateError } = await supabase
            .from('users')
            .update({ profile_image_url: publicUrl })
            .eq('id', profile.id);

        if (updateError) {
            console.error("Update error:", updateError.message);
        } else {
            setProfile({ ...profile, profile_image_url: publicUrl });
            setShowProfileImageModal(false);
            setSelectedProfileImage(null);
        }

        setUploading(false);
    };

    // Function to handle the uploading of cover image
    const handleCoverImageUpload = async () => {
        if (!selectedCoverImage || !profile) return;

        setUploading(true);

        // 1. Delete old cover image if it exists
        if (profile.cover_image_url) {
            const supabaseURLPrefix = import.meta.env.VITE_SUPABASE_STORAGE_URL_PREFIX!;
            const urlPrefix = `${supabaseURLPrefix}cover/`;
            const oldFilePath = profile.cover_image_url.replace(urlPrefix, '');

            const { error: deleteError } = await supabase.storage
                .from('profile-images')
                .remove([`profile/cover/${oldFilePath}`]);

            if (deleteError) {
                console.warn("Could not delete old cover image:", deleteError.message);
            }
        }

        // 2. Upload new cover image
        const fileExt = selectedCoverImage.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `profile/cover/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(filePath, selectedCoverImage, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError.message);
            setUploading(false);
            return;
        }

        // 3. Get public URL of the new cover image
        const {
            data: { publicUrl },
        } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);

        // 4. Update user's cover_image_url in Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({ cover_image_url: publicUrl })
            .eq('id', profile.id);

        if (updateError) {
            console.error("Update error:", updateError.message);
        } else {
            setProfile({ ...profile, cover_image_url: publicUrl });
            setShowCoverImageModal(false); // optional: close modal
            setSelectedCoverImage(null);
        }

        setUploading(false);
    };


    // Function to handle the saving of skills and about section
    if (!profile) {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4 text-gray-700 dark:text-gray-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
                <p className="text-lg font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => navigate("/")}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Close and go home"
            >
                <X className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            </button>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-[80%] h-[800px] mx-auto mt-6 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 flex flex-col"
            >
                <div className="w-[100%] h-[800px] mx-auto mt-6 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 flex flex-col">
                    {/* Cover Image Section - 1/3 */}
                    <div className="relative flex-[1.5] h-1/3 min-h-[240px] max-h-[300px] bg-gray-300 dark:bg-gray-700 overflow-visible">
                        {/* Cover Image */}
                        {profile.cover_image_url && (
                            <img
                                src={profile.cover_image_url}
                                alt="Cover"
                                className="object-cover w-full h-full"
                            />
                        )}

                        {/* Edit Cover Button */}
                        {isOwnProfile && (
                            <button
                                className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                onClick={() => setShowCoverImageModal(true)}
                            >
                                <Camera size={18} />
                                Edit Cover
                            </button>
                        )}

                        {/* Profile Picture */}
                        <div className="absolute bottom-[-75px] left-10 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white p-1 shadow-md">
                            <img
                                src={profile.profile_image_url || "/default-image.jpg"}
                                alt="Profile"
                                className="h-full w-full rounded-full object-cover scale-110"
                            />
                            {isOwnProfile && (
                                <button
                                    className="absolute right-2 top-[90px] sm:top-[120px] flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => setShowProfileImageModal(true)}
                                    aria-label="Edit profile picture"
                                >
                                    <Camera size={18} className="text-gray-800 dark:text-gray-200" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bio Section - 2/3 */}
                    <div className="flex-[2.5] p-10 overflow-y-auto">
                        <div className="flex items-start gap-2">
                            {/* Profile image spacer */}
                            <div className="w-[12rem] shrink-0" />
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
                                    <span className="text-base ml-7 text-gray-700 dark:text-gray-300">
                                        {profile.location || "No location provided"}
                                    </span>
                                </p>
                            </div>
                            {/* Edit button */}
                            {isOwnProfile && (
                                <button
                                    className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => setShowEditDetailsModal(true)}
                                >
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
                                    onClick={() => setShowEditSkillsAboutModal(true)}
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
            </motion.div>
            {/* Profile Picture edit Modal */}
            <Modal isOpen={showProfileImageModal} onClose={() => setShowProfileImageModal(false)} maxWidthClass="max-w-md">
                <div className="max-w-md w-full h-96 bg-white dark:bg-gray-800 p-6 rounded-xl mx-auto flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-center">Change Profile Picture</h2>

                    <div className="flex-grow flex flex-col items-center justify-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedProfileImage(e.target.files?.[0] || null)}
                            className="block"
                        />
                        {selectedProfileImage && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProfileImage.name}</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setShowProfileImageModal(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleProfileImageUpload}
                            disabled={!selectedProfileImage || uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? "Uploading..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Cover Image edit Modal */}
            <Modal isOpen={showCoverImageModal} onClose={() => setShowCoverImageModal(false)} maxWidthClass="max-w-md">
                <div className="max-w-md w-full h-96 bg-white dark:bg-gray-800 p-6 rounded-xl mx-auto flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-center">Change Cover Image</h2>

                    <div className="flex-grow flex flex-col items-center justify-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedCoverImage(e.target.files?.[0] || null)}
                            className="block"
                        />
                        {selectedCoverImage && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedCoverImage.name}</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setShowCoverImageModal(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCoverImageUpload}
                            disabled={!selectedCoverImage || uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? "Uploading..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Details Modal */}
            <Modal isOpen={showEditDetailsModal} onClose={() => setShowEditDetailsModal(false)} maxWidthClass="max-w-md">
                <div className="max-w-md w-full h-[420px] bg-white dark:bg-gray-800 p-6 rounded-xl mx-auto flex flex-col">
                    <h2 className="text-lg font-semibold mb-6 text-center">
                        Edit Profile Details
                    </h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveDetails(e);
                            setShowEditDetailsModal(false);
                        }}
                        className="flex flex-col gap-4 flex-grow"
                    >
                        <label className="flex flex-col text-gray-700 dark:text-gray-300">
                            Profession
                            <input
                                type="text"
                                value={profession}
                                onChange={(e) => setProfession(e.target.value)}
                                placeholder="e.g. Software Engineer"
                                className="mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </label>

                        <label className="flex flex-col text-gray-700 dark:text-gray-300">
                            Location
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. San Francisco, CA"
                                className="mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </label>

                        <label className="flex flex-col text-gray-700 dark:text-gray-300">
                            GitHub URL
                            <input
                                type="url"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/yourusername"
                                className="mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </label>

                        <div className="flex justify-end gap-3 mt-auto">
                            <button
                                type="button"
                                onClick={() => setShowEditDetailsModal(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Edit Skills and About Modal */}
            <Modal isOpen={showEditSkillsAboutModal} onClose={() => setShowEditSkillsAboutModal(false)} maxWidthClass="max-w-4xl">
                <div className="max-w-3xl w-full h-[700px] bg-white dark:bg-gray-800 p-8 rounded-xl mx-auto flex flex-col">
                    <h2 className="text-xl font-semibold mb-8 text-center">
                        Edit Skills & About
                    </h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveSkillsAbout(e);
                            setShowEditSkillsAboutModal(false);
                        }}
                        className="flex flex-col gap-6 flex-grow"
                    >
                        {/* Skills inputs */}
                        <div className="flex flex-col text-gray-700 dark:text-gray-300">
                            <label className="mb-3 font-medium text-lg">Skills (3 inputs)</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={skill1}
                                    onChange={(e) => setSkill1(e.target.value)}
                                    placeholder="Skill 1"
                                    className="flex-1 p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg"
                                />
                                <input
                                    type="text"
                                    value={skill2}
                                    onChange={(e) => setSkill2(e.target.value)}
                                    placeholder="Skill 2"
                                    className="flex-1 p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg"
                                />
                                <input
                                    type="text"
                                    value={skill3}
                                    onChange={(e) => setSkill3(e.target.value)}
                                    placeholder="Skill 3"
                                    className="flex-1 p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg"
                                />
                            </div>
                        </div>

                        {/* About textarea */}
                        <label className="flex flex-col text-gray-700 dark:text-gray-300 text-lg">
                            About
                            <textarea
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                placeholder="Tell us about yourself..."
                                maxLength={500}
                                rows={8}
                                className="mt-2 p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none text-lg"
                            />
                        </label>

                        <div className="flex justify-end gap-4 mt-auto">
                            <button
                                type="button"
                                onClick={() => setShowEditSkillsAboutModal(false)}
                                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-m"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );


}

