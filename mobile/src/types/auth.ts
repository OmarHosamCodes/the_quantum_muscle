export interface User {
	id: string;
	email: string;
	name?: string;
	avatar_url?: string;
	user_type: "trainee" | "trainer";
	created_at: string;
	updated_at: string;
}

export interface AuthState {
	user: User | null;
	session: import("@supabase/supabase-js").Session | null;
	loading: boolean;
	initialized: boolean;
}

export interface SignInCredentials {
	email: string;
	password: string;
}

export interface SignUpCredentials {
	email: string;
	password: string;
	name: string;
	userType: "trainee" | "trainer";
}

export interface ResetPasswordCredentials {
	email: string;
}

export interface AuthError {
	message: string;
	code?: string;
}
