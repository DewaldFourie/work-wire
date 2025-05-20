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
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
            },
        },
    });

    if (error) {
        throw new Error(error.message);
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