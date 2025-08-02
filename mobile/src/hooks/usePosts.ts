import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Type for the post data
interface Post {
	id: string;
	author: {
		id: string;
		name: string;
		avatar_url: string | null;
		user_type: "trainee" | "trainer";
	};
	content: string;
	media_url: string | null;
	likes_count: number;
	comments_count: number;
	created_at: string;
	is_liked: boolean;
}

// Fetch posts with pagination from Supabase
const fetchPosts = async ({ pageParam = 0 }, currentUserId?: string) => {
	const pageSize = 10;
	const from = pageParam * pageSize;
	const to = from + pageSize - 1;

	// Fetch posts with author information, likes count, and comments count
	const { data: posts, error } = await supabase
		.from("content")
		.select(`
			id,
			title,
			description,
			content_url,
			created_at,
			author:users!content_author_id_fkey (
				id,
				name,
				profile_image_url,
				user_type
			)
		`)
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		throw new Error(`Failed to fetch posts: ${error.message}`);
	}

	if (!posts) {
		return {
			posts: [],
			nextPage: undefined,
			hasMore: false,
		};
	}

	// For each post, get likes count, comments count, and check if current user liked it
	const postsWithCounts = await Promise.all(
		posts.map(async (post) => {
			// Get likes count
			const { count: likesCount } = await supabase
				.from("content_likes")
				.select("*", { count: "exact", head: true })
				.eq("content_id", post.id);

			// Get comments count
			const { count: commentsCount } = await supabase
				.from("content_comments")
				.select("*", { count: "exact", head: true })
				.eq("content_id", post.id);

			// Check if current user liked this post
			let isLiked = false;
			if (currentUserId) {
				const { data: userLike } = await supabase
					.from("content_likes")
					.select("content_id")
					.eq("content_id", post.id)
					.eq("user_id", currentUserId)
					.single();

				isLiked = !!userLike;
			}

			return {
				id: post.id,
				author: {
					id: post.author?.id || "",
					name: post.author?.name || "Unknown",
					avatar_url: post.author?.profile_image_url || null,
					user_type: post.author?.user_type || "trainee",
				},
				content: post.description || post.title || "",
				media_url: post.content_url || null,
				likes_count: likesCount || 0,
				comments_count: commentsCount || 0,
				created_at: post.created_at || new Date().toISOString(),
				is_liked: isLiked,
			} as Post;
		}),
	);

	return {
		posts: postsWithCounts,
		nextPage: postsWithCounts.length === pageSize ? pageParam + 1 : undefined,
		hasMore: postsWithCounts.length === pageSize,
	};
};

export const usePosts = (currentUserId?: string) => {
	return useInfiniteQuery({
		queryKey: ["posts", currentUserId],
		queryFn: ({ pageParam }) => fetchPosts({ pageParam }, currentUserId),
		getNextPageParam: (lastPage) => lastPage.nextPage,
		initialPageParam: 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
