import { supabase } from "../supabase/client";

// This function is used to sign up a user with their email and password in supabase
export async function signUpWithEmail({
    email,
    password,
    username,
}: {
    email: string;
    password: string;
    username: string;
}) {
    // 1. Check if username already exists in 'users' table
    const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .limit(1)
        .maybeSingle();

    if (fetchError) {
        throw new Error("Failed to check username uniqueness: " + fetchError.message);
    }

    if (existingUsers) {
        throw new Error("Username already taken. Please choose another.");
    }

    // 2. Sign up user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username },
        },
    });

    if (signUpError) {
        throw new Error(signUpError.message);
    }

    if (!data.user) {
        throw new Error("User signup failed: no user returned.");
    }

    const { id } = data.user;

    // 3. Insert user info into 'users' table
    const { error: insertError } = await supabase.from("users").insert([
        {
            id,
            email,
            username,
            public: true
        },
    ]);

    if (insertError) {
        throw new Error("Failed to insert user profile: " + insertError.message);
    }

    // 4. Add user to "WorkWire Global" group
    const WORKWIRE_GROUP_ID = import.meta.env.VITE_WORKWIRE_GLOBAL_GROUP_ID;

    if (!WORKWIRE_GROUP_ID) {
        throw new Error("Missing WorkWire Global group ID");
    }

    const { error: groupInsertError } = await supabase
        .from("group_members")
        .insert([
            {
                group_id: WORKWIRE_GROUP_ID,
                user_id: id,
            },
        ]);

    if (groupInsertError) {
        throw new Error("Failed to add user to WorkWire Global group: " + groupInsertError.message);
    }

    return data;
}




// This function is used to sign in a user with their email and password in supabase
export async function signInWithEmail({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// This function is used to sign out a user in supabase
export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}

// This function is to sign a user in with the demo account
export async function logInAsDemoUser() {
    const demoEmail = "demo@demo.com";
    const demoPassword = "demopassword";

    return await signInWithEmail({
        email: demoEmail,
        password: demoPassword,
    });
}