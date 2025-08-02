import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Function to like/unlike a post in Supabase
const toggleLikePost = async (postId: string, userId: string) => {
	// Check if the user has already liked this post
	const { data: existingLike, error: checkError } = await supabase
		.from("content_likes")
		.select("content_id")
		.eq("content_id", postId)
		.eq("user_id", userId)
		.single();

	if (checkError && checkError.code !== "PGRST116") {
		// PGRST116 is "not found" error, which is expected when no like exists
		throw new Error(`Failed to check like status: ${checkError.message}`);
	}

	if (existingLike) {
		// Unlike the post
		const { error: deleteError } = await supabase
			.from("content_likes")
			.delete()
			.eq("content_id", postId)
			.eq("user_id", userId);

		if (deleteError) {
			throw new Error(`Failed to unlike post: ${deleteError.message}`);
		}

		return { liked: false };
	} else {
		// Like the post
		const { error: insertError } = await supabase.from("content_likes").insert({
			content_id: postId,
			user_id: userId,
		});

		if (insertError) {
			throw new Error(`Failed to like post: ${insertError.message}`);
		}

		return { liked: true };
	}
};

export const useLikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
			toggleLikePost(postId, userId),
		onMutate: async ({ postId }) => {
			// Cancel any outgoing refetches for posts
			await queryClient.cancelQueries({ queryKey: ["posts"] });

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData(["posts"]);

			// Optimistically update the posts
			queryClient.setQueryData(["posts"], (oldData: unknown) => {
				if (!oldData || typeof oldData !== "object") return oldData;

				const data = oldData as {
					pages: Array<{
						posts: Array<{
							id: string;
							is_liked: boolean;
							likes_count: number;
							[key: string]: unknown;
						}>;
						[key: string]: unknown;
					}>;
					[key: string]: unknown;
				};

				return {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						posts: page.posts.map((post) => {
							if (post.id === postId) {
								const isCurrentlyLiked = post.is_liked;
								return {
									...post,
									is_liked: !isCurrentlyLiked,
									likes_count: isCurrentlyLiked
										? post.likes_count - 1
										: post.likes_count + 1,
								};
							}
							return post;
						}),
					})),
				};
			});

			return { previousPosts };
		},
		onError: (_err, _variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousPosts) {
				queryClient.setQueryData(["posts"], context.previousPosts);
			}
		},
		onSettled: (_data, _error, variables) => {
			// Always refetch after error or success to ensure data consistency
			queryClient.invalidateQueries({ queryKey: ["posts", variables.userId] });
		},
	});
};
