import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentService } from "../lib/contentService";

// Hook to create a new post
export const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: contentService.createPost,
		onSuccess: () => {
			// Invalidate posts query to refresh the feed
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
};

// Hook to delete a post
export const useDeletePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
			contentService.deletePost(postId, userId),
		onSuccess: () => {
			// Invalidate posts query to refresh the feed
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
};

// Hook to get comments for a post
export const usePostComments = (postId: string) => {
	return useQuery({
		queryKey: ["postComments", postId],
		queryFn: () => contentService.getPostComments(postId),
		enabled: !!postId,
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Hook to add a comment
export const useAddComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			comment,
			userId,
		}: {
			postId: string;
			comment: string;
			userId: string;
		}) => contentService.addComment(postId, comment, userId),
		onSuccess: (_data, variables) => {
			// Update the comments cache
			queryClient.invalidateQueries({
				queryKey: ["postComments", variables.postId],
			});
			// Also invalidate posts to update comment count
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
};

// Hook to delete a comment
export const useDeleteComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			commentId,
			userId,
			postId,
		}: {
			commentId: number;
			userId: string;
			postId: string; // Added for cache invalidation
		}) => contentService.deleteComment(commentId, userId),
		onSuccess: (_data, variables) => {
			// Update the comments cache
			queryClient.invalidateQueries({
				queryKey: ["postComments", variables.postId],
			});
			// Also invalidate posts to update comment count
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
};

// Hook to follow/unfollow a user
export const useToggleFollow = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			followerId,
			followingId,
		}: {
			followerId: string;
			followingId: string;
		}) => contentService.toggleFollow(followerId, followingId),
		onSuccess: (_data, variables) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ["userFollowers", variables.followingId],
			});
			queryClient.invalidateQueries({
				queryKey: ["userFollowing", variables.followerId],
			});
			queryClient.invalidateQueries({
				queryKey: ["userProfile", variables.followingId],
			});
			queryClient.invalidateQueries({
				queryKey: ["userProfile", variables.followerId],
			});
		},
	});
};

// Hook to get user's followers
export const useUserFollowers = (userId: string) => {
	return useQuery({
		queryKey: ["userFollowers", userId],
		queryFn: () => contentService.getUserFollowers(userId),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Hook to get users that a user is following
export const useUserFollowing = (userId: string) => {
	return useQuery({
		queryKey: ["userFollowing", userId],
		queryFn: () => contentService.getUserFollowing(userId),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
