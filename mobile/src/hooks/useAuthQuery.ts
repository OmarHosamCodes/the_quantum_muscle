import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "../lib/queryClient";
import { authService, ensureUserRecord, supabase } from "../lib/supabase";
import type {
	ResetPasswordFormData,
	SignInFormData,
	SignUpFormData,
	User,
} from "../schemas/auth";
import { userSchema } from "../schemas/auth";

// Helper function to map Supabase user to our User type
const mapSupabaseUser = (
	supabaseUser: import("@supabase/supabase-js").User | null,
): User | null => {
	if (!supabaseUser || !supabaseUser.email) return null;

	try {
		return userSchema.parse({
			id: supabaseUser.id,
			email: supabaseUser.email,
			name: supabaseUser.user_metadata?.name || supabaseUser.email,
			avatar_url: supabaseUser.user_metadata?.avatar_url,
			user_type: supabaseUser.user_metadata?.user_type || "trainee",
			created_at: supabaseUser.created_at || new Date().toISOString(),
			updated_at: supabaseUser.updated_at || new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error parsing user data:", error);
		return null;
	}
};

// Auth queries
export const useSession = () => {
	return useQuery({
		queryKey: queryKeys.auth.session(),
		queryFn: async () => {
			try {
				const { data, error } = await authService.getSession();
				if (error) {
					console.warn("Session error:", error);
					return null;
				}
				return data.session;
			} catch (error) {
				console.error("Session query error:", error);
				return null;
			}
		},
		staleTime: 30 * 60 * 1000, // 30 minutes
		retry: 1, // Only retry once for auth queries
		retryDelay: 1000,
	});
};

export const useUser = () => {
	return useQuery({
		queryKey: queryKeys.auth.user(),
		queryFn: async () => {
			try {
				const { data: sessionData, error: sessionError } =
					await authService.getSession();
				if (sessionError) {
					console.warn("User session error:", sessionError);
					return null;
				}
				return mapSupabaseUser(sessionData.session?.user ?? null);
			} catch (error) {
				console.error("User query error:", error);
				return null;
			}
		},
		staleTime: 30 * 60 * 1000, // 30 minutes
		retry: 1, // Only retry once for auth queries
		retryDelay: 1000,
	});
};

// Auth mutations
export const useSignIn = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: SignInFormData) => {
			const { data, error } = await authService.signIn(
				credentials.email,
				credentials.password,
			);
			if (error) throw new Error(error);
			return data;
		},
		onSuccess: () => {
			// Invalidate and refetch auth-related queries
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
		},
	});
};

export const useSignUp = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: SignUpFormData) => {
			const { data, error } = await authService.signUp(
				credentials.email,
				credentials.password,
				{
					name: credentials.name,
					user_type: credentials.userType,
				},
			);
			if (error) throw new Error(error);
			return data;
		},
		onSuccess: () => {
			// Invalidate and refetch auth-related queries
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
		},
	});
};

export const useSignOut = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const { error } = await authService.signOut();
			if (error) throw new Error(error);
		},
		onSuccess: () => {
			// Clear all auth-related queries
			queryClient.removeQueries({ queryKey: queryKeys.auth.session() });
			queryClient.removeQueries({ queryKey: queryKeys.auth.user() });
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: async (credentials: ResetPasswordFormData) => {
			const { error } = await authService.resetPassword(credentials.email);
			if (error) throw new Error(error);
			return { success: true };
		},
	});
};

// Combined auth state hook
export const useAuth = () => {
	const queryClient = useQueryClient();

	const {
		data: session,
		isLoading: sessionLoading,
		error: sessionError,
		isSuccess: sessionSuccess,
	} = useSession();
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
		isSuccess: userSuccess,
	} = useUser();

	// Set up auth state change listener
	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log(
					"Auth state changed (useAuthQuery):",
					event,
					session?.user?.id,
				);

				if (event === "SIGNED_OUT") {
					console.log("User signed out - clearing queries");
					// Clear all auth-related queries
					queryClient.setQueryData(queryKeys.auth.session(), null);
					queryClient.setQueryData(queryKeys.auth.user(), null);
					queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
					queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
				} else if (event === "SIGNED_IN" && session?.user) {
					console.log("User signed in - ensuring user record");

					// Ensure user record exists in our database
					const userRecordResult = await ensureUserRecord(session.user);
					if (userRecordResult.error) {
						console.error(
							"Failed to ensure user record:",
							userRecordResult.error,
						);
					}

					// Invalidate queries to refetch with new data
					queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
					queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
				} else if (event === "TOKEN_REFRESHED") {
					console.log("Token refreshed - invalidating queries");
					queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
					queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
				}
			},
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [queryClient]);

	// Consider auth initialized when both queries have completed (success or error)
	const isInitialized = sessionSuccess && userSuccess;
	const loading = !isInitialized && (sessionLoading || userLoading);

	// Debug logging
	console.log("Auth state:", {
		session: !!session,
		user: !!user,
		sessionLoading,
		userLoading,
		sessionSuccess,
		userSuccess,
		isInitialized,
		loading,
		sessionError: sessionError?.message,
		userError: userError?.message,
	});

	return {
		user,
		session,
		loading,
		error: sessionError || userError,
		isAuthenticated: !!session && !!user,
		isInitialized,
	};
};
