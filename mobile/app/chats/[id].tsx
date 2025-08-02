import { Avatar } from "@/src/components/ui/Avatar";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

// Mock data for demonstration
const mockChat = {
	id: "1",
	participants: [
		{ id: "1", name: "John Smith", avatar_url: null, user_type: "trainer" },
		{ id: "2", name: "Sarah Johnson", avatar_url: null, user_type: "trainee" },
	],
	messages: [
		{
			id: "1",
			content: "Hi Sarah! How's your training going?",
			sender_id: "1",
			created_at: "2024-01-15T14:30:00Z",
			is_read: true,
		},
		{
			id: "2",
			content:
				"Great! I've been following the program and feeling stronger every week.",
			sender_id: "2",
			created_at: "2024-01-15T14:32:00Z",
			is_read: true,
		},
		{
			id: "3",
			content:
				"That's fantastic! I noticed you've been hitting your targets consistently. Keep up the great work! 💪",
			sender_id: "1",
			created_at: "2024-01-15T14:35:00Z",
			is_read: true,
		},
		{
			id: "4",
			content: "Thanks! I have a question about the deadlift form though.",
			sender_id: "2",
			created_at: "2024-01-15T14:40:00Z",
			is_read: false,
		},
	],
};

// Mock function to fetch chat details
const fetchChatDetails = async (chatId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// In a real app, this would fetch from Supabase
	return mockChat;
};

// Mock function to send message
const sendMessage = async (
	chatId: string,
	content: string,
	senderId: string,
) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// In a real app, this would send to Supabase
	const newMessage = {
		id: Date.now().toString(),
		content,
		sender_id: senderId,
		created_at: new Date().toISOString(),
		is_read: false,
	};

	return newMessage;
};

export default function ChatDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [messageText, setMessageText] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const flatListRef = useRef<FlatList>(null);

	const {
		data: chat,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["chat", id],
		queryFn: () => fetchChatDetails(id),
		enabled: !!id,
	});

	const sendMessageMutation = useMutation({
		mutationFn: ({ content }: { content: string }) =>
			sendMessage(id, content, user?.id || ""),
		onSuccess: (newMessage) => {
			// Optimistically update the chat
			queryClient.setQueryData(["chat", id], (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					messages: [...oldData.messages, newMessage],
				};
			});
			setMessageText("");
		},
	});

	const getOtherParticipant = () => {
		if (!chat) return null;
		return chat.participants.find((participant) => participant.id !== user?.id);
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const handleSendMessage = () => {
		if (!messageText.trim()) return;

		sendMessageMutation.mutate({ content: messageText.trim() });
	};

	const renderMessage = ({ item }: { item: any }) => {
		const isMyMessage = item.sender_id === user?.id;
		const otherParticipant = getOtherParticipant();

		return (
			<View
				style={[
					styles.messageContainer,
					isMyMessage ? styles.myMessage : styles.otherMessage,
				]}
			>
				{!isMyMessage && (
					<Avatar
						size={32}
						source={
							otherParticipant?.avatar_url
								? { uri: otherParticipant.avatar_url }
								: undefined
						}
						fallback={otherParticipant?.name.charAt(0) || "U"}
						style={styles.messageAvatar}
					/>
				)}

				<View
					style={[
						styles.messageBubble,
						isMyMessage ? styles.myBubble : styles.otherBubble,
					]}
				>
					<Text
						style={[
							styles.messageText,
							isMyMessage ? styles.myMessageText : styles.otherMessageText,
						]}
					>
						{item.content}
					</Text>
					<View style={styles.messageFooter}>
						<Text style={styles.messageTime}>
							{formatTime(item.created_at)}
						</Text>
						{isMyMessage && (
							<Ionicons
								name={item.is_read ? "checkmark-done" : "checkmark"}
								size={12}
								color={item.is_read ? "#0891b2" : "#64748b"}
							/>
						)}
					</View>
				</View>
			</View>
		);
	};

	const renderTypingIndicator = () => {
		if (!isTyping) return null;

		return (
			<View style={[styles.messageContainer, styles.otherMessage]}>
				<Avatar
					size={32}
					source={
						getOtherParticipant()?.avatar_url
							? { uri: getOtherParticipant()?.avatar_url }
							: undefined
					}
					fallback={getOtherParticipant()?.name.charAt(0) || "U"}
					style={styles.messageAvatar}
				/>
				<View
					style={[
						styles.messageBubble,
						styles.otherBubble,
						styles.typingBubble,
					]}
				>
					<View style={styles.typingDots}>
						<View style={styles.typingDot} />
						<View style={styles.typingDot} />
						<View style={styles.typingDot} />
					</View>
				</View>
			</View>
		);
	};

	if (isLoading) {
		return (
			<Screen>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading chat...</Text>
				</View>
			</Screen>
		);
	}

	if (error || !chat) {
		return (
			<Screen>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Failed to load chat</Text>
				</View>
			</Screen>
		);
	}

	const otherParticipant = getOtherParticipant();

	return (
		<Screen>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Ionicons name="arrow-back" size={24} color="#1e293b" />
					</TouchableOpacity>

					<TouchableOpacity style={styles.participantInfo}>
						<Avatar
							size={40}
							source={
								otherParticipant?.avatar_url
									? { uri: otherParticipant.avatar_url }
									: undefined
							}
							fallback={otherParticipant?.name.charAt(0) || "U"}
						/>
						<View style={styles.participantDetails}>
							<Text style={styles.participantName}>
								{otherParticipant?.name}
							</Text>
							<Text style={styles.participantStatus}>Online</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity style={styles.moreButton}>
						<Ionicons name="ellipsis-vertical" size={24} color="#1e293b" />
					</TouchableOpacity>
				</View>

				{/* Messages */}
				<FlatList
					ref={flatListRef}
					data={chat.messages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					style={styles.messagesList}
					contentContainerStyle={styles.messagesContainer}
					showsVerticalScrollIndicator={false}
					onContentSizeChange={() =>
						flatListRef.current?.scrollToEnd({ animated: true })
					}
					ListFooterComponent={renderTypingIndicator}
				/>

				{/* Message Input */}
				<View style={styles.inputContainer}>
					<View style={styles.inputWrapper}>
						<TextInput
							style={styles.messageInput}
							placeholder="Type a message..."
							value={messageText}
							onChangeText={setMessageText}
							multiline
							maxLength={500}
							placeholderTextColor="#64748b"
						/>
						<TouchableOpacity
							style={[
								styles.sendButton,
								!messageText.trim() && styles.sendButtonDisabled,
							]}
							onPress={handleSendMessage}
							disabled={!messageText.trim() || sendMessageMutation.isPending}
						>
							<Ionicons
								name="send"
								size={20}
								color={messageText.trim() ? "#ffffff" : "#64748b"}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
		color: "#64748b",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		color: "#ef4444",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#e2e8f0",
		backgroundColor: "#ffffff",
	},
	backButton: {
		padding: 4,
		marginRight: 12,
	},
	participantInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	participantDetails: {
		marginLeft: 12,
	},
	participantName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
	},
	participantStatus: {
		fontSize: 12,
		color: "#10b981",
	},
	moreButton: {
		padding: 4,
	},
	messagesList: {
		flex: 1,
	},
	messagesContainer: {
		padding: 16,
	},
	messageContainer: {
		flexDirection: "row",
		marginBottom: 12,
	},
	myMessage: {
		justifyContent: "flex-end",
	},
	otherMessage: {
		justifyContent: "flex-start",
	},
	messageAvatar: {
		marginRight: 8,
	},
	messageBubble: {
		maxWidth: "75%",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 18,
	},
	myBubble: {
		backgroundColor: "#0891b2",
		borderBottomRightRadius: 4,
	},
	otherBubble: {
		backgroundColor: "#f1f5f9",
		borderBottomLeftRadius: 4,
	},
	typingBubble: {
		paddingVertical: 8,
	},
	messageText: {
		fontSize: 16,
		lineHeight: 22,
	},
	myMessageText: {
		color: "#ffffff",
	},
	otherMessageText: {
		color: "#1e293b",
	},
	messageFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginTop: 4,
	},
	messageTime: {
		fontSize: 11,
		color: "#64748b",
		marginRight: 4,
	},
	typingDots: {
		flexDirection: "row",
		alignItems: "center",
	},
	typingDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: "#64748b",
		marginRight: 4,
		opacity: 0.6,
	},
	inputContainer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#e2e8f0",
		backgroundColor: "#ffffff",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "flex-end",
		backgroundColor: "#f8fafc",
		borderRadius: 24,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: "#e2e8f0",
	},
	messageInput: {
		flex: 1,
		fontSize: 16,
		color: "#1e293b",
		maxHeight: 100,
		paddingVertical: 8,
	},
	sendButton: {
		backgroundColor: "#0891b2",
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 8,
	},
	sendButtonDisabled: {
		backgroundColor: "#e2e8f0",
	},
});
