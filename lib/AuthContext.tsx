"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "./supabase";
import { User, AuthError } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setIsLoading(false);

                // If user just signed up or signed in, migrate data
                if (event === "SIGNED_IN" && session?.user) {
                    await migrateDataToUser(session.user.id);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/konto/reset`,
        });
        return { error };
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Get the current user ID (auth user or device_id fallback)
export function getUserId(): string {
    if (typeof window === "undefined") return "";

    // Check localStorage for device ID as fallback
    let deviceId = localStorage.getItem("rikedom_device_id");
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("rikedom_device_id", deviceId);
    }

    return deviceId;
}

// Migrate data from device_id to authenticated user
async function migrateDataToUser(userId: string): Promise<void> {
    if (typeof window === "undefined") return;

    const deviceId = localStorage.getItem("rikedom_device_id");
    if (!deviceId) return;

    const supabase = createClient();

    // Check if user already has data (returning user)
    const { data: existingAffirmation } = await supabase
        .from("affirmations")
        .select("id")
        .eq("user_id", userId)
        .single();

    // If user already has data, don't overwrite
    if (existingAffirmation) {
        console.log("User already has data, skipping migration");
        return;
    }

    // Migrate affirmations
    await supabase
        .from("affirmations")
        .update({ user_id: userId })
        .eq("user_id", deviceId);

    // Migrate reading logs
    await supabase
        .from("reading_log")
        .update({ user_id: userId })
        .eq("user_id", deviceId);

    // Migrate self confidence pledges
    await supabase
        .from("self_confidence_pledges")
        .update({ user_id: userId })
        .eq("user_id", deviceId);

    // Migrate self confidence logs
    await supabase
        .from("self_confidence_log")
        .update({ user_id: userId })
        .eq("user_id", deviceId);

    console.log("Data migrated from device to user account");
}

// Get user ID for database operations (prefers auth user, falls back to device_id)
export async function getAuthenticatedUserId(): Promise<string> {
    if (typeof window === "undefined") return "";

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
        return session.user.id;
    }

    // Fallback to device ID
    return getUserId();
}
