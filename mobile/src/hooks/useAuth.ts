import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { authService, supabase } from "../lib/supabase";
import type {
	AuthState,
	SignInCredentials,
	SignUpCredentials,
} from "../types/auth";

// Helper function to map Supabase user to our User type
const mapSupabaseUser = (
	supabaseUser: import("@supabase/supabase-js").User | null,
) => {
	if (!supabaseUser || !supabaseUser.email) return null;

	return {
		id: supabaseUser.id,
		email: supabaseUser.email,
		name: supabaseUser.user_metadata?.name || supabaseUser.email,
		avatar_url: supabaseUser.user_metadata?.avatar_url,
		user_type: supabaseUser.user_metadata?.user_type || "trainee",
		created_at: supabaseUser.created_at || new Date().toISOString(),
		updated_at: supabaseUser.updated_at || new Date().toISOString(),
	};
};

export const useAuth = () => {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		session: null,
		loading: true,
		initialized: false,
	});

	const [actionLoading, setActionLoading] = useState(false);

	// Initialize auth state
	useEffect(() => {
		let mounted = true;

		const initializeAuth = async () => {
			try {
				const { data } = await authService.getSession();
				if (mounted) {
					setAuthState({
						user: mapSupabaseUser(data.session?.user ?? null),
						session: data.session,
						loading: false,
						initialized: true,
					});
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
				if (mounted) {
					setAuthState({
						user: null,
						session: null,
						loading: false,
						initialized: true,
					});
				}
			}
		};

		initializeAuth();

		return () => {
			mounted = false;
		};
	}, []);

	// Listen to auth state changes
	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log("Auth state changed:", event, session?.user?.id);

				setAuthState((prev) => ({
					...prev,
					user: mapSupabaseUser(session?.user ?? null),
					session,
					loading: false,
					initialized: true,
				}));

				// Handle specific auth events
				if (event === "SIGNED_OUT") {
					// Clear any cached data here
					console.log("User signed out");
				} else if (event === "SIGNED_IN") {
					console.log("User signed in");
				} else if (event === "TOKEN_REFRESHED") {
					console.log("Token refreshed");
				}
			},
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	// Handle app state changes for auto-refresh
	useEffect(() => {
		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			if (nextAppState === "active") {
				supabase.auth.startAutoRefresh();
			} else {
				supabase.auth.stopAutoRefresh();
			}
		};

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange,
		);

		return () => {
			subscription?.remove();
		};
	}, []);

	const signIn = useCallback(async (credentials: SignInCredentials) => {
		setActionLoading(true);
		try {
			const { data, error } = await authService.signIn(
				credentials.email,
				credentials.password,
			);

			if (error) {
				throw new Error(error);
			}

			return { success: true, data };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Sign in failed";
			return { success: false, error: message };
		} finally {
			setActionLoading(false);
		}
	}, []);

	const signUp = useCallback(async (credentials: SignUpCredentials) => {
		setActionLoading(true);
		try {
			const { data, error } = await authService.signUp(
				credentials.email,
				credentials.password,
				{
					name: credentials.name,
					user_type: credentials.userType,
				},
			);

			if (error) {
				throw new Error(error);
			}

			return { success: true, data };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Sign up failed";
			return { success: false, error: message };
		} finally {
			setActionLoading(false);
		}
	}, []);

	const signOut = useCallback(async () => {
		setActionLoading(true);
		try {
			const { error } = await authService.signOut();

			if (error) {
				throw new Error(error);
			}

			return { success: true };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Sign out failed";
			return { success: false, error: message };
		} finally {
			setActionLoading(false);
		}
	}, []);

	const resetPassword = useCallback(async (email: string) => {
		setActionLoading(true);
		try {
			const { error } = await authService.resetPassword(email);

			if (error) {
				throw new Error(error);
			}

			return { success: true };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Password reset failed";
			return { success: false, error: message };
		} finally {
			setActionLoading(false);
		}
	}, []);

	return {
		// State
		user: authState.user,
		session: authState.session,
		loading: authState.loading,
		initialized: authState.initialized,
		actionLoading,
		isAuthenticated: !!authState.user,

		// Actions
		signIn,
		signUp,
		signOut,
		resetPassword,
	};
};
