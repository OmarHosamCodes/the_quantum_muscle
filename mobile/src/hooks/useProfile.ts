import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import { supabase } from "../lib/supabase";
import { type User, userSchema } from "../schemas/auth";

// Types for user profile operations
interface UpdateProfileData {
	name?: string;
	avatar_url?: string;
}

// Query to fetch user profile
export const useUserProfile = (userId?: string) => {
	return useQuery({
		queryKey: ["userProfile", userId],
		queryFn: async () => {
			if (!userId) throw new Error("User ID is required");

			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) throw error;
			return userSchema.parse(data);
		},
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Mutation to update user profile
export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			userId,
			updates,
		}: {
			userId: string;
			updates: UpdateProfileData;
		}) => {
			const { data, error } = await supabase
				.from("profiles")
				.update(updates)
				.eq("id", userId)
				.select()
				.single();

			if (error) throw error;
			return userSchema.parse(data);
		},
		onSuccess: (data, variables) => {
			// Update the profile cache
			queryClient.setQueryData(["userProfile", variables.userId], data);
			// Also invalidate the auth user query to reflect changes
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
		},
	});
};

// Example of optimistic updates
export const useUpdateProfileOptimistic = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			userId,
			updates,
		}: {
			userId: string;
			updates: UpdateProfileData;
		}) => {
			const { data, error } = await supabase
				.from("profiles")
				.update(updates)
				.eq("id", userId)
				.select()
				.single();

			if (error) throw error;
			return userSchema.parse(data);
		},
		onMutate: async ({ userId, updates }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });

			// Snapshot the previous value
			const previousProfile = queryClient.getQueryData<User>([
				"userProfile",
				userId,
			]);

			// Optimistically update the cache
			if (previousProfile) {
				queryClient.setQueryData(["userProfile", userId], {
					...previousProfile,
					...updates,
				});
			}

			// Return a context object with the snapshotted value
			return { previousProfile };
		},
		onError: (_err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousProfile) {
				queryClient.setQueryData(
					["userProfile", variables.userId],
					context.previousProfile,
				);
			}
		},
		onSettled: (_data, _error, variables) => {
			// Always refetch after error or success
			queryClient.invalidateQueries({
				queryKey: ["userProfile", variables.userId],
			});
		},
	});
};
