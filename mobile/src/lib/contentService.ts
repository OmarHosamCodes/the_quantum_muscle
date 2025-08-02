import { supabase } from "./supabase";

// Types for content operations
export interface CreatePostData {
	title: string;
	description?: string;
	content_url: string; // Required by the database schema
	author_id: string;
}

export interface PostComment {
	id: number;
	comment: string;
	author_id: string | null;
	content_id: string | null;
	created_at: string | null;
	author?: {
		id: string;
		name: string;
		profile_image_url: string | null;
	};
}

// Content/Posts service functions
export const contentService = {
	// Create a new post
	async createPost(postData: CreatePostData) {
		const { data, error } = await supabase
			.from("content")
			.insert({
				title: postData.title,
				description: postData.description,
				content_url: postData.content_url,
				author_id: postData.author_id,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to create post: ${error.message}`);
		}

		return data;
	},

	// Delete a post
	async deletePost(postId: string, userId: string) {
		// First verify the user owns this post
		const { data: post, error: fetchError } = await supabase
			.from("content")
			.select("author_id")
			.eq("id", postId)
			.single();

		if (fetchError) {
			throw new Error(`Failed to fetch post: ${fetchError.message}`);
		}

		if (post.author_id !== userId) {
			throw new Error("You can only delete your own posts");
		}

		const { error } = await supabase.from("content").delete().eq("id", postId);

		if (error) {
			throw new Error(`Failed to delete post: ${error.message}`);
		}

		return { success: true };
	},

	// Get comments for a post
	async getPostComments(postId: string) {
		const { data, error } = await supabase
			.from("content_comments")
			.select(`
				id,
				comment,
				author_id,
				content_id,
				created_at,
				author:users!content_comments_author_id_fkey (
					id,
					name,
					profile_image_url
				)
			`)
			.eq("content_id", postId)
			.order("created_at", { ascending: true });

		if (error) {
			throw new Error(`Failed to fetch comments: ${error.message}`);
		}

		return data as PostComment[];
	},

	// Add a comment to a post
	async addComment(postId: string, comment: string, userId: string) {
		const { data, error } = await supabase
			.from("content_comments")
			.insert({
				content_id: postId,
				comment,
				author_id: userId,
			})
			.select(`
				id,
				comment,
				author_id,
				content_id,
				created_at,
				author:users!content_comments_author_id_fkey (
					id,
					name,
					profile_image_url
				)
			`)
			.single();

		if (error) {
			throw new Error(`Failed to add comment: ${error.message}`);
		}

		return data as PostComment;
	},

	// Delete a comment
	async deleteComment(commentId: number, userId: string) {
		// First verify the user owns this comment
		const { data: comment, error: fetchError } = await supabase
			.from("content_comments")
			.select("author_id")
			.eq("id", commentId)
			.single();

		if (fetchError) {
			throw new Error(`Failed to fetch comment: ${fetchError.message}`);
		}

		if (comment.author_id !== userId) {
			throw new Error("You can only delete your own comments");
		}

		const { error } = await supabase
			.from("content_comments")
			.delete()
			.eq("id", commentId);

		if (error) {
			throw new Error(`Failed to delete comment: ${error.message}`);
		}

		return { success: true };
	},

	// Follow/unfollow a user
	async toggleFollow(followerId: string, followingId: string) {
		// Check if already following
		const { data: existingFollow, error: checkError } = await supabase
			.from("followers")
			.select("follower_id")
			.eq("follower_id", followerId)
			.eq("following_id", followingId)
			.single();

		if (checkError && checkError.code !== "PGRST116") {
			throw new Error(`Failed to check follow status: ${checkError.message}`);
		}

		if (existingFollow) {
			// Unfollow
			const { error: deleteError } = await supabase
				.from("followers")
				.delete()
				.eq("follower_id", followerId)
				.eq("following_id", followingId);

			if (deleteError) {
				throw new Error(`Failed to unfollow: ${deleteError.message}`);
			}

			// Manually update follower counts
			const { data: followingUser } = await supabase
				.from("users")
				.select("follower_count")
				.eq("id", followingId)
				.single();

			const { data: followerUser } = await supabase
				.from("users")
				.select("following_count")
				.eq("id", followerId)
				.single();

			await Promise.all([
				supabase
					.from("users")
					.update({
						follower_count: Math.max(
							0,
							(followingUser?.follower_count || 0) - 1,
						),
					})
					.eq("id", followingId),
				supabase
					.from("users")
					.update({
						following_count: Math.max(
							0,
							(followerUser?.following_count || 0) - 1,
						),
					})
					.eq("id", followerId),
			]);

			return { following: false };
		} else {
			// Follow
			const { error: insertError } = await supabase.from("followers").insert({
				follower_id: followerId,
				following_id: followingId,
			});

			if (insertError) {
				throw new Error(`Failed to follow: ${insertError.message}`);
			}

			// Manually update follower counts
			const { data: followingUser } = await supabase
				.from("users")
				.select("follower_count")
				.eq("id", followingId)
				.single();

			const { data: followerUser } = await supabase
				.from("users")
				.select("following_count")
				.eq("id", followerId)
				.single();

			await Promise.all([
				supabase
					.from("users")
					.update({ follower_count: (followingUser?.follower_count || 0) + 1 })
					.eq("id", followingId),
				supabase
					.from("users")
					.update({ following_count: (followerUser?.following_count || 0) + 1 })
					.eq("id", followerId),
			]);

			return { following: true };
		}
	},

	// Get user's followers
	async getUserFollowers(userId: string) {
		const { data, error } = await supabase
			.from("followers")
			.select(`
				follower_id,
				follower:users!followers_follower_id_fkey (
					id,
					name,
					profile_image_url,
					user_type
				)
			`)
			.eq("following_id", userId);

		if (error) {
			throw new Error(`Failed to fetch followers: ${error.message}`);
		}

		return data.map((item) => item.follower).filter(Boolean);
	},

	// Get users that a user is following
	async getUserFollowing(userId: string) {
		const { data, error } = await supabase
			.from("followers")
			.select(`
				following_id,
				following:users!followers_following_id_fkey (
					id,
					name,
					profile_image_url,
					user_type
				)
			`)
			.eq("follower_id", userId);

		if (error) {
			throw new Error(`Failed to fetch following: ${error.message}`);
		}

		return data.map((item) => item.following).filter(Boolean);
	},
};
