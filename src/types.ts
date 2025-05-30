export type UserProfile = {
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

export type Message = {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    deleted: boolean;
    is_group_message: boolean;
    group_id?: string; 
    image_url?: string;
};

export type Group = {
	id: string;
	name: string;
	created_by: string;
	created_at: string;
};
