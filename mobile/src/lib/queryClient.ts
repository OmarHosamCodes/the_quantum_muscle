import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
		},
		mutations: {
			retry: 1,
			retryDelay: 1000,
		},
	},
});

// Query keys factory
export const queryKeys = {
	auth: {
		user: () => ["auth", "user"] as const,
		session: () => ["auth", "session"] as const,
	},
	// Add more query keys as needed
} as const;
