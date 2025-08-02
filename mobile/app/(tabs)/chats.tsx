import { Avatar } from "@/src/components/ui/Avatar";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

// Mock data for demonstration
const mockChats = [
	{
		id: "1",
		participants: [
			{ id: "1", name: "John Smith", avatar_url: null, user_type: "trainer" },
			{
				id: "2",
				name: "Sarah Johnson",
				avatar_url: null,
				user_type: "trainee",
			},
		],
		last_message: {
			content: "Great progress on your workout today! Keep it up! 💪",
			sender_id: "1",
			created_at: "2024-01-15T14:30:00Z",
		},
		unread_count: 2,
		is_active: true,
	},
	{
		id: "2",
		participants: [
			{ id: "1", name: "Mike Chen", avatar_url: null, user_type: "trainee" },
			{ id: "3", name: "Emma Davis", avatar_url: null, user_type: "trainer" },
		],
		last_message: {
			content: "When is our next session scheduled?",
			sender_id: "1",
			created_at: "2024-01-15T12:15:00Z",
		},
		unread_count: 0,
		is_active: true,
	},
	{
		id: "3",
		participants: [
			{ id: "4", name: "Alex Wilson", avatar_url: null, user_type: "trainee" },
			{ id: "5", name: "Lisa Brown", avatar_url: null, user_type: "trainer" },
		],
		last_message: {
			content: "I've updated your program for next week",
			sender_id: "5",
			created_at: "2024-01-14T16:45:00Z",
		},
		unread_count: 1,
		is_active: true,
	},
];

// Mock function to fetch chats
const fetchChats = async (userId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Filter chats where the current user is a participant
	return mockChats.filter((chat) =>
		chat.participants.some((participant) => participant.id === userId),
	);
};

export default function ChatsScreen() {
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");

	const {
		data: chats = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["chats", user?.id],
		queryFn: () => fetchChats(user?.id || ""),
		enabled: !!user,
	});

	const filteredChats = chats.filter((chat) => {
		if (!searchQuery) return true;

		const otherParticipant = chat.participants.find(
			(participant) => participant.id !== user?.id,
		);

		return otherParticipant?.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
	});

	const handleChatPress = (chatId: string) => {
		router.push(`/chats/${chatId}`);
	};

	const getOtherParticipant = (chat: any) => {
		return chat.participants.find((participant) => participant.id !== user?.id);
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			return "Just now";
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}h ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	const renderChat = ({ item }: { item: any }) => {
		const otherParticipant = getOtherParticipant(item);
		const isLastMessageFromMe = item.last_message.sender_id === user?.id;

		return (
			<TouchableOpacity onPress={() => handleChatPress(item.id)}>
				<Card style={styles.chatCard}>
					<View style={styles.chatHeader}>
						<Avatar
							size={50}
							source={
								otherParticipant.avatar_url
									? { uri: otherParticipant.avatar_url }
									: undefined
							}
							fallback={otherParticipant.name.charAt(0)}
						/>
						<View style={styles.chatInfo}>
							<View style={styles.chatTopRow}>
								<Text style={styles.chatName}>{otherParticipant.name}</Text>
								<Text style={styles.chatTime}>
									{formatTime(item.last_message.created_at)}
								</Text>
							</View>
							<View style={styles.chatBottomRow}>
								<Text style={styles.lastMessage} numberOfLines={1}>
									{isLastMessageFromMe ? "You: " : ""}
									{item.last_message.content}
								</Text>
								{item.unread_count > 0 && (
									<View style={styles.unreadBadge}>
										<Text style={styles.unreadText}>{item.unread_count}</Text>
									</View>
								)}
							</View>
						</View>
					</View>
				</Card>
			</TouchableOpacity>
		);
	};

	return (
		<Screen>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Chats</Text>
					<TouchableOpacity style={styles.newChatButton}>
						<Ionicons name="add" size={24} color="#ffffff" />
					</TouchableOpacity>
				</View>

				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<Ionicons
						name="search"
						size={20}
						color="#64748b"
						style={styles.searchIcon}
					/>
					<TextInput
						style={styles.searchInput}
						placeholder="Search conversations..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholderTextColor="#64748b"
					/>
				</View>

				{/* Chats List */}
				<FlatList
					data={filteredChats}
					renderItem={renderChat}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.chatsList}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<Ionicons name="chatbubbles-outline" size={48} color="#64748b" />
							<Text style={styles.emptyTitle}>No conversations yet</Text>
							<Text style={styles.emptySubtitle}>
								Start a conversation with your trainer or trainee to get
								started!
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
	newChatButton: {
		backgroundColor: "#0891b2",
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f8fafc",
		borderRadius: 12,
		paddingHorizontal: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#e2e8f0",
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		paddingVertical: 12,
		fontSize: 16,
		color: "#1e293b",
	},
	chatsList: {
		paddingBottom: 20,
	},
	chatCard: {
		marginBottom: 12,
		padding: 16,
	},
	chatHeader: {
		flexDirection: "row",
		alignItems: "center",
	},
	chatInfo: {
		flex: 1,
		marginLeft: 12,
	},
	chatTopRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	chatName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
	},
	chatTime: {
		fontSize: 12,
		color: "#64748b",
	},
	chatBottomRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	lastMessage: {
		flex: 1,
		fontSize: 14,
		color: "#64748b",
		marginRight: 8,
	},
	unreadBadge: {
		backgroundColor: "#0891b2",
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 6,
	},
	unreadText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#ffffff",
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
