import { createUserRecord, supabase } from "../lib/supabase";
import type { Users } from "../types/supabase";

/**
 * Get user from the database by ID
 */
export const getUserById = async (userId: string): Promise<Users | null> => {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) {
			console.error("Error fetching user:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Unexpected error fetching user:", error);
		return null;
	}
};

/**
 * Get user from the database by email
 */
export const getUserByEmail = async (email: string): Promise<Users | null> => {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("email", email)
			.single();

		if (error) {
			console.error("Error fetching user by email:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Unexpected error fetching user by email:", error);
		return null;
	}
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (
	userId: string,
	updates: Partial<
		Pick<Users, "name" | "bio" | "phone" | "age" | "profile_image_url">
	>,
): Promise<{ success: boolean; error?: string }> => {
	try {
		const { error } = await supabase
			.from("users")
			.update(updates)
			.eq("id", userId);

		if (error) {
			console.error("Error updating user profile:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Unexpected error updating user profile:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to update profile",
		};
	}
};

/**
 * Manually create a user record (useful for testing or admin functions)
 */
export const createUser = async (
	userId: string,
	email: string,
	name: string,
	userType: "trainee" | "trainer",
): Promise<{ success: boolean; error?: string }> => {
	const result = await createUserRecord(userId, email, name, userType);
	return {
		success: !result.error,
		error: result.error || undefined,
	};
};
