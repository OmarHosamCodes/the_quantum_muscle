import { useMutation, useQueryClient } from "@tanstack/react-query";

// Mock function to like/unlike a post
const toggleLikePost = async (postId: string, userId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// In a real app, this would update Supabase
	console.log("Toggling like for post:", postId, "by user:", userId);

	return { success: true };
};

export const useLikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
			toggleLikePost(postId, userId),
		onMutate: async ({ postId, userId }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["posts"] });

			// Snapshot the previous value
			const previousPosts = queryClient.getQueryData(["posts"]);

			// Optimistically update the posts
			queryClient.setQueryData(["posts"], (oldData: any) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					pages: oldData.pages.map((page: any) => ({
						...page,
						posts: page.posts.map((post: any) => {
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
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousPosts) {
				queryClient.setQueryData(["posts"], context.previousPosts);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
};
