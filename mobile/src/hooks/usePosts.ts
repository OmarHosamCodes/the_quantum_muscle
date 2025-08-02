import { useInfiniteQuery } from "@tanstack/react-query";

// Mock function to fetch posts with pagination
const fetchPosts = async ({ pageParam = 0 }) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Mock data - in a real app, this would fetch from Supabase
	const mockPosts = [
		{
			id: "1",
			author: {
				id: "1",
				name: "Sarah Johnson",
				avatar_url: null,
				user_type: "trainee",
			},
			content:
				"Just completed an amazing upper body workout! 💪 The new program my trainer created is really pushing me to my limits.",
			media_url: null,
			likes_count: 24,
			comments_count: 8,
			created_at: "2024-01-15T10:30:00Z",
			is_liked: false,
		},
		{
			id: "2",
			author: {
				id: "2",
				name: "Mike Chen",
				avatar_url: null,
				user_type: "trainee",
			},
			content:
				"Progress update: Hit a new PR on deadlifts today! 315lbs for 3 reps. Feeling stronger every week.",
			media_url: null,
			likes_count: 42,
			comments_count: 15,
			created_at: "2024-01-15T09:15:00Z",
			is_liked: true,
		},
		{
			id: "3",
			author: {
				id: "3",
				name: "Emma Davis",
				avatar_url: null,
				user_type: "trainee",
			},
			content:
				"Started my fitness journey 3 months ago and I'm already seeing incredible results. Consistency is key! 🎯",
			media_url: null,
			likes_count: 67,
			comments_count: 23,
			created_at: "2024-01-15T08:45:00Z",
			is_liked: false,
		},
		{
			id: "4",
			author: {
				id: "4",
				name: "John Smith",
				avatar_url: null,
				user_type: "trainer",
			},
			content:
				"Proud of my clients' progress this week! Remember, small consistent efforts lead to big results. Keep pushing! 💪",
			media_url: null,
			likes_count: 89,
			comments_count: 12,
			created_at: "2024-01-15T07:30:00Z",
			is_liked: false,
		},
		{
			id: "5",
			author: {
				id: "5",
				name: "Lisa Brown",
				avatar_url: null,
				user_type: "trainer",
			},
			content:
				"New program alert! Just created a 12-week strength program for intermediate lifters. DM me for details!",
			media_url: null,
			likes_count: 156,
			comments_count: 34,
			created_at: "2024-01-14T16:20:00Z",
			is_liked: true,
		},
	];

	// Simulate pagination
	const start = pageParam * 5;
	const end = start + 5;
	const posts = mockPosts.slice(start, end);

	return {
		posts,
		nextPage: posts.length === 5 ? pageParam + 1 : undefined,
		hasMore: posts.length === 5,
	};
};

export const usePosts = () => {
	return useInfiniteQuery({
		queryKey: ["posts"],
		queryFn: fetchPosts,
		getNextPageParam: (lastPage) => lastPage.nextPage,
		initialPageParam: 0,
	});
};
