import AsyncStorage from "@react-native-async-storage/async-storage";
import { type AuthError, createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		"Missing Supabase environment variables. Please check your .env file.",
	);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
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
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: metadata,
			},
		});

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
