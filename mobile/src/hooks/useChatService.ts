import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type ChatMessage, chatService } from "../lib/chatService";

// Hook to get user's chats
export const useUserChats = (userId: string) => {
	return useQuery({
		queryKey: ["userChats", userId],
		queryFn: () => chatService.getUserChats(userId),
		enabled: !!userId,
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Hook to create a new chat
export const useCreateChat = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userIds: string[]) => chatService.createChat(userIds),
		onSuccess: () => {
			// Invalidate user chats for all participants
			queryClient.invalidateQueries({ queryKey: ["userChats"] });
		},
	});
};

// Hook to get messages for a specific chat
export const useChatMessages = (
	chatId: string,
	limit?: number,
	offset?: number,
) => {
	return useQuery({
		queryKey: ["chatMessages", chatId, limit, offset],
		queryFn: () => chatService.getChatMessages(chatId, limit, offset),
		enabled: !!chatId,
		staleTime: 10 * 1000, // 10 seconds
	});
};

// Hook to send a message
export const useSendMessage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			chatId,
			senderId,
			message,
		}: {
			chatId: string;
			senderId: string;
			message: string;
		}) => chatService.sendMessage(chatId, senderId, message),
		onMutate: async ({ chatId, senderId, message }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["chatMessages", chatId] });

			// Snapshot the previous value
			const previousMessages = queryClient.getQueryData<ChatMessage[]>([
				"chatMessages",
				chatId,
			]);

			// Optimistically add the new message
			const optimisticMessage: ChatMessage = {
				id: `temp-${Date.now()}`, // Temporary ID
				chat_id: chatId,
				sender_id: senderId,
				message,
				message_type: "text",
				message_url: null,
				created_at: new Date().toISOString(),
				sender: undefined, // Will be populated by real response
			};

			queryClient.setQueryData<ChatMessage[]>(
				["chatMessages", chatId],
				(old) => (old ? [...old, optimisticMessage] : [optimisticMessage]),
			);

			return { previousMessages };
		},
		onError: (_err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousMessages) {
				queryClient.setQueryData(
					["chatMessages", variables.chatId],
					context.previousMessages,
				);
			}
		},
		onSuccess: (data, variables) => {
			// Replace the optimistic message with the real one
			queryClient.setQueryData<ChatMessage[]>(
				["chatMessages", variables.chatId],
				(old) => {
					if (!old) return [data];
					// Replace the temporary message with the real one
					return old.map((msg) =>
						msg.id.startsWith("temp-") && msg.message === data.message
							? data
							: msg,
					);
				},
			);

			// Invalidate user chats to update last message
			queryClient.invalidateQueries({
				queryKey: ["userChats", variables.senderId],
			});
		},
	});
};

// Hook to find or create a direct chat
export const useFindOrCreateDirectChat = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId1, userId2 }: { userId1: string; userId2: string }) =>
			chatService.findOrCreateDirectChat(userId1, userId2),
		onSuccess: () => {
			// Invalidate user chats for both users
			queryClient.invalidateQueries({ queryKey: ["userChats"] });
		},
	});
};

// Hook to subscribe to real-time messages in a chat
export const useChatMessagesSubscription = (
	chatId: string,
	enabled: boolean = true,
) => {
	const queryClient = useQueryClient();
	const [subscription, setSubscription] = useState<{
		unsubscribe: () => void;
	} | null>(null);

	useEffect(() => {
		if (!enabled || !chatId) return;

		const handleNewMessage = (message: ChatMessage) => {
			// Add the new message to the cache
			queryClient.setQueryData<ChatMessage[]>(
				["chatMessages", chatId],
				(old) => (old ? [...old, message] : [message]),
			);

			// Update user chats to reflect the new last message
			queryClient.invalidateQueries({ queryKey: ["userChats"] });
		};

		const sub = chatService.subscribeToMessages(chatId, handleNewMessage);
		setSubscription(sub);

		return () => {
			if (sub) {
				sub.unsubscribe();
			}
		};
	}, [chatId, enabled, queryClient]);

	useEffect(() => {
		return () => {
			if (subscription) {
				subscription.unsubscribe();
			}
		};
	}, [subscription]);

	return subscription;
};

// Hook to get or create a direct chat and navigate to it
export const useDirectChat = () => {
	const findOrCreateChat = useFindOrCreateDirectChat();

	return {
		...findOrCreateChat,
		openDirectChat: async (currentUserId: string, targetUserId: string) => {
			try {
				const result = await findOrCreateChat.mutateAsync({
					userId1: currentUserId,
					userId2: targetUserId,
				});
				return result;
			} catch (error) {
				console.error("Failed to open direct chat:", error);
				throw error;
			}
		},
	};
};
