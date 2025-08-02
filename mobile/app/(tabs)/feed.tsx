import { Avatar } from "@/src/components/ui/Avatar";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { useLikePost } from "@/src/hooks/useLikePost";
import { usePosts } from "@/src/hooks/usePosts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function FeedScreen() {
	const { user } = useAuth();
	const [refreshing, setRefreshing] = useState(false);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		refetch,
	} = usePosts();

	const likePostMutation = useLikePost();

	const onRefresh = async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	};

	const handleLike = async (postId: string) => {
		if (!user?.id) return;
		likePostMutation.mutate({ postId, userId: user.id });
	};

	const handleComment = (postId: string) => {
		// TODO: Navigate to comment screen
		console.log("Comment on post:", postId);
	};

	const renderPost = ({ item }: { item: any }) => (
		<Card style={styles.postCard}>
			{/* Post Header */}
			<View style={styles.postHeader}>
				<View style={styles.authorInfo}>
					<Avatar
						size={40}
						source={
							item.author.avatar_url
								? { uri: item.author.avatar_url }
								: undefined
						}
						fallback={item.author.name.charAt(0)}
					/>
					<View style={styles.authorDetails}>
						<Text style={styles.authorName}>{item.author.name}</Text>
						<Text style={styles.postTime}>
							{new Date(item.created_at).toLocaleDateString()}
						</Text>
					</View>
				</View>
				<TouchableOpacity style={styles.moreButton}>
					<Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
				</TouchableOpacity>
			</View>

			{/* Post Content */}
			<Text style={styles.postContent}>{item.content}</Text>

			{/* Post Actions */}
			<View style={styles.postActions}>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => handleLike(item.id)}
				>
					<Ionicons
						name={item.is_liked ? "heart" : "heart-outline"}
						size={20}
						color={item.is_liked ? "#ef4444" : "#64748b"}
					/>
					<Text style={[styles.actionText, item.is_liked && styles.likedText]}>
						{item.likes_count}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => handleComment(item.id)}
				>
					<Ionicons name="chatbubble-outline" size={20} color="#64748b" />
					<Text style={styles.actionText}>{item.comments_count}</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.actionButton}>
					<Ionicons name="share-outline" size={20} color="#64748b" />
				</TouchableOpacity>
			</View>
		</Card>
	);

	const renderFooter = () => {
		if (!isFetchingNextPage) return null;
		return (
			<View style={styles.loadingFooter}>
				<Text style={styles.loadingText}>Loading more posts...</Text>
			</View>
		);
	};

	const allPosts = data?.pages.flatMap((page) => page.posts) || [];

	return (
		<Screen>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Feed</Text>
					<TouchableOpacity style={styles.createButton}>
						<Ionicons name="add" size={24} color="#ffffff" />
					</TouchableOpacity>
				</View>

				{/* Posts List */}
				<FlatList
					data={allPosts}
					renderItem={renderPost}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.postsList}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					onEndReached={() => {
						if (hasNextPage && !isFetchingNextPage) {
							fetchNextPage();
						}
					}}
					onEndReachedThreshold={0.5}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<Ionicons name="newspaper-outline" size={48} color="#64748b" />
							<Text style={styles.emptyTitle}>No posts yet</Text>
							<Text style={styles.emptySubtitle}>
								Be the first to share your fitness journey!
							</Text>
						</View>
					}
				/>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "600",
		color: "#1e293b",
	},
	createButton: {
		backgroundColor: "#0891b2",
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	postsList: {
		paddingBottom: 20,
	},
	postCard: {
		marginBottom: 16,
		padding: 16,
	},
	postHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	authorInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	authorDetails: {
		marginLeft: 12,
		flex: 1,
	},
	authorName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
	},
	postTime: {
		fontSize: 12,
		color: "#64748b",
		marginTop: 2,
	},
	moreButton: {
		padding: 4,
	},
	postContent: {
		fontSize: 16,
		color: "#1e293b",
		lineHeight: 24,
		marginBottom: 16,
	},
	postActions: {
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#f1f5f9",
		paddingTop: 12,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 24,
	},
	actionText: {
		fontSize: 14,
		color: "#64748b",
		marginLeft: 6,
	},
	likedText: {
		color: "#ef4444",
	},
	loadingFooter: {
		padding: 20,
		alignItems: "center",
	},
	loadingText: {
		fontSize: 14,
		color: "#64748b",
	},
	emptyState: {
		alignItems: "center",
		padding: 40,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1e293b",
		marginTop: 16,
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#64748b",
		textAlign: "center",
		marginTop: 8,
	},
});
