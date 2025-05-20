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

    // 3. Insert user info into your 'users' table
    const { id } = data.user;

    const { error: insertError } = await supabase.from("users").insert([
        {
            id,
            email,
            username,
        },
    ]);

    if (insertError) {
        // Optional: You could consider rolling back auth user here if insert fails
        throw new Error("Failed to insert user profile: " + insertError.message);
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