import AsyncStorage from "@react-native-async-storage/async-storage";
import { type AuthError, createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import type { Database } from "../types/supabase";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		"Missing Supabase environment variables. Please check your .env file.",
	);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

// Helper function to handle auth errors
export const handleAuthError = (error: AuthError | null): string | null => {
	if (!error) return null;

	// Map common Supabase auth errors to user-friendly messages
	const errorMap: Record<string, string> = {
		invalid_credentials: "Invalid email or password. Please try again.",
		email_not_confirmed:
			"Please check your email and click the confirmation link.",
		signup_disabled: "New registrations are currently disabled.",
		email_address_invalid: "Please enter a valid email address.",
		password_too_short: "Password must be at least 6 characters long.",
		user_already_registered: "An account with this email already exists.",
		invalid_request: "Invalid request. Please check your input and try again.",
	};

	return (
		errorMap[error.message] || error.message || "An unexpected error occurred."
	);
};

// Helper function to generate a unique rat_id
const generateRatId = (): string => {
	const timestamp = Date.now().toString(36);
	const randomStr = Math.random().toString(36).substring(2, 8);
	return `rat_${timestamp}_${randomStr}`;
};

// Helper function to create user record in database
export const createUserRecord = async (
	userId: string,
	email: string,
	name: string,
	userType: "trainee" | "trainer",
): Promise<{ error: string | null }> => {
	try {
		const { error } = await supabase.from("users").insert({
			id: userId,
			email,
			name,
			user_type: userType,
			rat_id: generateRatId(),
			created_at: new Date().toISOString(),
		});

		if (error) {
			console.error("Error creating user record:", error);
			return { error: error.message };
		}

		return { error: null };
	} catch (error) {
		console.error("Unexpected error creating user record:", error);
		return {
			error:
				error instanceof Error ? error.message : "Failed to create user record",
		};
	}
};

// Helper function to ensure user record exists (call this on first sign in)
export const ensureUserRecord = async (
	supabaseUser: import("@supabase/supabase-js").User,
): Promise<{ error: string | null }> => {
	try {
		// First check if user record already exists
		const { data: existingUser, error: fetchError } = await supabase
			.from("users")
			.select("id")
			.eq("id", supabaseUser.id)
			.single();

		if (fetchError && fetchError.code !== "PGRST116") {
			// PGRST116 is "not found" error, which is expected for new users
			console.error("Error checking existing user:", fetchError);
			return { error: fetchError.message };
		}

		// If user record already exists, no need to create it
		if (existingUser) {
			return { error: null };
		}

		// Create user record with metadata from auth user
		const name =
			supabaseUser.user_metadata?.name || supabaseUser.email || "Unknown";
		const userType =
			(supabaseUser.user_metadata?.user_type as "trainee" | "trainer") ||
			"trainee";

		if (!supabaseUser.email) {
			return { error: "User email is required but not available" };
		}

		return await createUserRecord(
			supabaseUser.id,
			supabaseUser.email,
			name,
			userType,
		);
	} catch (error) {
		console.error("Unexpected error ensuring user record:", error);
		return {
			error:
				error instanceof Error ? error.message : "Failed to ensure user record",
		};
	}
};

// Auth service functions
export const authService = {
	async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		return {
			data,
			error: handleAuthError(error),
		};
	},

	async signUp(
		email: string,
		password: string,
		metadata?: Record<string, unknown>,
	) {
		// Create the auth user (this will send a confirmation email if enabled)
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: metadata,
			},
		});

		// Note: We don't create the user record here because the user might need
		// to confirm their email first. The user record will be created when the
		// user's email is confirmed and they sign in for the first time.

		return {
			data,
			error: handleAuthError(error),
		};
	},

	async signOut() {
		const { error } = await supabase.auth.signOut();
		return {
			error: handleAuthError(error),
		};
	},

	async resetPassword(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/callback`,
		});

		return {
			error: handleAuthError(error),
		};
	},

	async updatePassword(password: string) {
		const { error } = await supabase.auth.updateUser({
			password,
		});

		return {
			error: handleAuthError(error),
		};
	},

	async getSession() {
		const { data, error } = await supabase.auth.getSession();
		return {
			data,
			error: handleAuthError(error),
		};
	},
};
