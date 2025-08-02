import { supabase } from "./supabase";

// Types for chat operations
export interface ChatMessage {
	id: string;
	chat_id: string;
	sender_id: string | null;
	message: string;
	message_type: "text" | "image" | "program_request" | null;
	message_url: string | null;
	created_at: string | null;
	sender?: {
		id: string;
		name: string;
		profile_image_url: string | null;
	};
}

export interface Chat {
	id: string;
	created_at: string | null;
	participants: Array<{
		id: string;
		name: string;
		profile_image_url: string | null;
		user_type: "trainee" | "trainer";
	}>;
	last_message?: ChatMessage;
}

// Chat service functions
export const chatService = {
	// Get all chats for a user
	async getUserChats(userId: string) {
		const { data: chatParticipants, error } = await supabase
			.from("chat_participants")
			.select(`
				chat_id,
				chats (
					id,
					created_at
				)
			`)
			.eq("user_id", userId);

		if (error) {
			throw new Error(`Failed to fetch user chats: ${error.message}`);
		}

		if (!chatParticipants) return [];

		// For each chat, get all participants and the last message
		const chats = await Promise.all(
			chatParticipants.map(async (chatParticipant) => {
				if (!chatParticipant.chats) return null;

				const chatId = chatParticipant.chats.id;

				// Get all participants
				const { data: participants, error: participantsError } = await supabase
					.from("chat_participants")
					.select(`
						user_id,
						users (
							id,
							name,
							profile_image_url,
							user_type
						)
					`)
					.eq("chat_id", chatId)
					.neq("user_id", userId); // Exclude current user

				if (participantsError) {
					console.error("Failed to fetch participants:", participantsError);
					return null;
				}

				// Get the last message
				const { data: lastMessage, error: messageError } = await supabase
					.from("messages")
					.select(`
						id,
						chat_id,
						sender_id,
						message,
						message_type,
						message_url,
						created_at,
						sender:users!messages_sender_id_fkey (
							id,
							name,
							profile_image_url
						)
					`)
					.eq("chat_id", chatId)
					.order("created_at", { ascending: false })
					.limit(1)
					.single();

				// Note: Don't throw error if no messages exist
				const lastMessageData =
					messageError?.code === "PGRST116" ? null : lastMessage;

				return {
					id: chatId,
					created_at: chatParticipant.chats.created_at,
					participants: participants?.map((p) => p.users).filter(Boolean) || [],
					last_message: lastMessageData,
				} as Chat;
			}),
		);

		return chats.filter(Boolean) as Chat[];
	},

	// Create a new chat between users
	async createChat(userIds: string[]) {
		if (userIds.length < 2) {
			throw new Error("Chat must have at least 2 participants");
		}

		// Create the chat
		const { data: chat, error: chatError } = await supabase
			.from("chats")
			.insert({})
			.select()
			.single();

		if (chatError) {
			throw new Error(`Failed to create chat: ${chatError.message}`);
		}

		// Add participants
		const participants = userIds.map((userId) => ({
			chat_id: chat.id,
			user_id: userId,
		}));

		const { error: participantsError } = await supabase
			.from("chat_participants")
			.insert(participants);

		if (participantsError) {
			// Clean up the chat if adding participants failed
			await supabase.from("chats").delete().eq("id", chat.id);
			throw new Error(
				`Failed to add participants: ${participantsError.message}`,
			);
		}

		return chat;
	},

	// Get messages for a chat
	async getChatMessages(
		chatId: string,
		limit: number = 50,
		offset: number = 0,
	) {
		const { data, error } = await supabase
			.from("messages")
			.select(`
				id,
				chat_id,
				sender_id,
				message,
				message_type,
				message_url,
				created_at,
				sender:users!messages_sender_id_fkey (
					id,
					name,
					profile_image_url
				)
			`)
			.eq("chat_id", chatId)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			throw new Error(`Failed to fetch messages: ${error.message}`);
		}

		return (data as ChatMessage[]).reverse(); // Reverse to show oldest first
	},

	// Send a message
	async sendMessage(chatId: string, senderId: string, messageText: string) {
		const { data, error } = await supabase
			.from("messages")
			.insert({
				chat_id: chatId,
				sender_id: senderId,
				message: messageText,
				message_type: "text",
			})
			.select(`
				id,
				chat_id,
				sender_id,
				message,
				message_type,
				message_url,
				created_at,
				sender:users!messages_sender_id_fkey (
					id,
					name,
					profile_image_url
				)
			`)
			.single();

		if (error) {
			throw new Error(`Failed to send message: ${error.message}`);
		}

		return data as ChatMessage;
	},

	// Find or create a direct chat between two users
	async findOrCreateDirectChat(userId1: string, userId2: string) {
		// First, try to find an existing chat between these two users
		const { data: existingChats, error: searchError } = await supabase
			.from("chat_participants")
			.select("chat_id")
			.in("user_id", [userId1, userId2]);

		if (searchError) {
			throw new Error(
				`Failed to search for existing chat: ${searchError.message}`,
			);
		}

		if (existingChats && existingChats.length > 0) {
			// Group by chat_id and find chats that have both users
			const chatCounts = existingChats.reduce(
				(acc, participant) => {
					acc[participant.chat_id] = (acc[participant.chat_id] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			// Find a chat that has exactly 2 participants (both users)
			for (const [chatId, count] of Object.entries(chatCounts)) {
				if (count === 2) {
					// Verify this chat has exactly 2 participants total
					const { data: allParticipants, error: verifyError } = await supabase
						.from("chat_participants")
						.select("user_id")
						.eq("chat_id", chatId);

					if (!verifyError && allParticipants?.length === 2) {
						return { id: chatId, created_at: null };
					}
				}
			}
		}

		// No existing chat found, create a new one
		return await this.createChat([userId1, userId2]);
	},

	// Subscribe to new messages in a chat
	subscribeToMessages(
		chatId: string,
		callback: (message: ChatMessage) => void,
	) {
		const subscription = supabase
			.channel(`messages:${chatId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `chat_id=eq.${chatId}`,
				},
				async (payload) => {
					// Fetch the complete message with sender info
					const { data: message, error } = await supabase
						.from("messages")
						.select(`
							id,
							chat_id,
							sender_id,
							message,
							message_type,
							message_url,
							created_at,
							sender:users!messages_sender_id_fkey (
								id,
								name,
								profile_image_url
							)
						`)
						.eq("id", payload.new.id)
						.single();

					if (message && !error) {
						callback(message as ChatMessage);
					}
				},
			)
			.subscribe();

		return subscription;
	},
};
