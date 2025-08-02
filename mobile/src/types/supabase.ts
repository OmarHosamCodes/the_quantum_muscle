export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instanciate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "12.2.12 (cd3cf9e)";
	};
	public: {
		Tables: {
			chat_participants: {
				Row: {
					chat_id: string;
					user_id: string;
				};
				Insert: {
					chat_id: string;
					user_id: string;
				};
				Update: {
					chat_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "chat_participants_chat_id_fkey";
						columns: ["chat_id"];
						isOneToOne: false;
						referencedRelation: "chats";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "chat_participants_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			chats: {
				Row: {
					created_at: string | null;
					id: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
				};
				Relationships: [];
			};
			content: {
				Row: {
					author_id: string | null;
					content_url: string;
					created_at: string | null;
					description: string | null;
					id: string;
					title: string;
				};
				Insert: {
					author_id?: string | null;
					content_url: string;
					created_at?: string | null;
					description?: string | null;
					id?: string;
					title: string;
				};
				Update: {
					author_id?: string | null;
					content_url?: string;
					created_at?: string | null;
					description?: string | null;
					id?: string;
					title?: string;
				};
				Relationships: [
					{
						foreignKeyName: "content_author_id_fkey";
						columns: ["author_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			content_comments: {
				Row: {
					author_id: string | null;
					comment: string;
					content_id: string | null;
					created_at: string | null;
					id: number;
				};
				Insert: {
					author_id?: string | null;
					comment: string;
					content_id?: string | null;
					created_at?: string | null;
					id?: number;
				};
				Update: {
					author_id?: string | null;
					comment?: string;
					content_id?: string | null;
					created_at?: string | null;
					id?: number;
				};
				Relationships: [
					{
						foreignKeyName: "content_comments_author_id_fkey";
						columns: ["author_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "content_comments_content_id_fkey";
						columns: ["content_id"];
						isOneToOne: false;
						referencedRelation: "content";
						referencedColumns: ["id"];
					},
				];
			};
			content_likes: {
				Row: {
					content_id: string;
					created_at: string | null;
					user_id: string;
				};
				Insert: {
					content_id: string;
					created_at?: string | null;
					user_id: string;
				};
				Update: {
					content_id?: string;
					created_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "content_likes_content_id_fkey";
						columns: ["content_id"];
						isOneToOne: false;
						referencedRelation: "content";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "content_likes_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			exercise_sets: {
				Row: {
					exercise_id: string | null;
					id: number;
					reps: number | null;
					set_index: number;
					weight_kg: number | null;
				};
				Insert: {
					exercise_id?: string | null;
					id?: number;
					reps?: number | null;
					set_index: number;
					weight_kg?: number | null;
				};
				Update: {
					exercise_id?: string | null;
					id?: number;
					reps?: number | null;
					set_index?: number;
					weight_kg?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "exercise_sets_exercise_id_fkey";
						columns: ["exercise_id"];
						isOneToOne: false;
						referencedRelation: "exercises";
						referencedColumns: ["id"];
					},
				];
			};
			exercises: {
				Row: {
					content_type: Database["public"]["Enums"]["content_type"] | null;
					content_url: string | null;
					created_at: string | null;
					id: string;
					name: string;
					target_muscle: string;
					workout_id: string | null;
				};
				Insert: {
					content_type?: Database["public"]["Enums"]["content_type"] | null;
					content_url?: string | null;
					created_at?: string | null;
					id?: string;
					name: string;
					target_muscle: string;
					workout_id?: string | null;
				};
				Update: {
					content_type?: Database["public"]["Enums"]["content_type"] | null;
					content_url?: string | null;
					created_at?: string | null;
					id?: string;
					name?: string;
					target_muscle?: string;
					workout_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "exercises_workout_id_fkey";
						columns: ["workout_id"];
						isOneToOne: false;
						referencedRelation: "workouts";
						referencedColumns: ["id"];
					},
				];
			};
			followers: {
				Row: {
					created_at: string | null;
					follower_id: string;
					following_id: string;
				};
				Insert: {
					created_at?: string | null;
					follower_id: string;
					following_id: string;
				};
				Update: {
					created_at?: string | null;
					follower_id?: string;
					following_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "followers_follower_id_fkey";
						columns: ["follower_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "followers_following_id_fkey";
						columns: ["following_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			messages: {
				Row: {
					chat_id: string | null;
					created_at: string | null;
					id: string;
					message: string;
					message_type: Database["public"]["Enums"]["message_type"] | null;
					message_url: string | null;
					program_request_id: string | null;
					sender_id: string | null;
				};
				Insert: {
					chat_id?: string | null;
					created_at?: string | null;
					id?: string;
					message: string;
					message_type?: Database["public"]["Enums"]["message_type"] | null;
					message_url?: string | null;
					program_request_id?: string | null;
					sender_id?: string | null;
				};
				Update: {
					chat_id?: string | null;
					created_at?: string | null;
					id?: string;
					message?: string;
					message_type?: Database["public"]["Enums"]["message_type"] | null;
					message_url?: string | null;
					program_request_id?: string | null;
					sender_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "messages_chat_id_fkey";
						columns: ["chat_id"];
						isOneToOne: false;
						referencedRelation: "chats";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "messages_program_request_id_fkey";
						columns: ["program_request_id"];
						isOneToOne: false;
						referencedRelation: "programs";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "messages_sender_id_fkey";
						columns: ["sender_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			program_rest_days: {
				Row: {
					day_name: string;
					program_id: string;
				};
				Insert: {
					day_name: string;
					program_id: string;
				};
				Update: {
					day_name?: string;
					program_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "program_rest_days_program_id_fkey";
						columns: ["program_id"];
						isOneToOne: false;
						referencedRelation: "programs";
						referencedColumns: ["id"];
					},
				];
			};
			program_trainees: {
				Row: {
					joined_at: string | null;
					program_id: string;
					trainee_id: string;
				};
				Insert: {
					joined_at?: string | null;
					program_id: string;
					trainee_id: string;
				};
				Update: {
					joined_at?: string | null;
					program_id?: string;
					trainee_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "program_trainees_program_id_fkey";
						columns: ["program_id"];
						isOneToOne: false;
						referencedRelation: "programs";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "program_trainees_trainee_id_fkey";
						columns: ["trainee_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			program_workouts: {
				Row: {
					order_index: number;
					program_id: string;
					workout_id: string;
				};
				Insert: {
					order_index: number;
					program_id: string;
					workout_id: string;
				};
				Update: {
					order_index?: number;
					program_id?: string;
					workout_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "program_workouts_program_id_fkey";
						columns: ["program_id"];
						isOneToOne: false;
						referencedRelation: "programs";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "program_workouts_workout_id_fkey";
						columns: ["workout_id"];
						isOneToOne: false;
						referencedRelation: "workouts";
						referencedColumns: ["id"];
					},
				];
			};
			programs: {
				Row: {
					created_at: string | null;
					id: string;
					name: string;
					trainer_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					name: string;
					trainer_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					name?: string;
					trainer_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "programs_trainer_id_fkey";
						columns: ["trainer_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			user_metrics: {
				Row: {
					date_recorded: string | null;
					height_cm: number | null;
					id: number;
					user_id: string | null;
					weight_kg: number | null;
				};
				Insert: {
					date_recorded?: string | null;
					height_cm?: number | null;
					id?: number;
					user_id?: string | null;
					weight_kg?: number | null;
				};
				Update: {
					date_recorded?: string | null;
					height_cm?: number | null;
					id?: number;
					user_id?: string | null;
					weight_kg?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "user_metrics_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			user_tags: {
				Row: {
					id: number;
					tag: string;
					user_id: string | null;
				};
				Insert: {
					id?: number;
					tag: string;
					user_id?: string | null;
				};
				Update: {
					id?: number;
					tag?: string;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "user_tags_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			users: {
				Row: {
					age: number | null;
					bio: string | null;
					created_at: string | null;
					email: string;
					follower_count: number | null;
					following_count: number | null;
					id: string;
					name: string;
					phone: string | null;
					profile_image_url: string | null;
					rat_id: string;
					user_type: Database["public"]["Enums"]["user_type"];
				};
				Insert: {
					age?: number | null;
					bio?: string | null;
					created_at?: string | null;
					email: string;
					follower_count?: number | null;
					following_count?: number | null;
					id?: string;
					name: string;
					phone?: string | null;
					profile_image_url?: string | null;
					rat_id: string;
					user_type: Database["public"]["Enums"]["user_type"];
				};
				Update: {
					age?: number | null;
					bio?: string | null;
					created_at?: string | null;
					email?: string;
					follower_count?: number | null;
					following_count?: number | null;
					id?: string;
					name?: string;
					phone?: string | null;
					profile_image_url?: string | null;
					rat_id?: string;
					user_type?: Database["public"]["Enums"]["user_type"];
				};
				Relationships: [];
			};
			workouts: {
				Row: {
					created_at: string | null;
					creator_id: string | null;
					id: string;
					image_url: string | null;
					name: string;
				};
				Insert: {
					created_at?: string | null;
					creator_id?: string | null;
					id?: string;
					image_url?: string | null;
					name: string;
				};
				Update: {
					created_at?: string | null;
					creator_id?: string | null;
					id?: string;
					image_url?: string | null;
					name?: string;
				};
				Relationships: [
					{
						foreignKeyName: "workouts_creator_id_fkey";
						columns: ["creator_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			content_type: "image" | "video" | "text";
			message_type: "text" | "image" | "program_request";
			user_type: "trainee" | "trainer";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			content_type: ["image", "video", "text"],
			message_type: ["text", "image", "program_request"],
			user_type: ["trainee", "trainer"],
		},
	},
} as const;

export type ChatParticipants = Tables<"chat_participants">;
export type Chats = Tables<"chats">;
export type Content = Tables<"content">;
export type ContentComments = Tables<"content_comments">;
export type ContentLikes = Tables<"content_likes">;
export type ExerciseSets = Tables<"exercise_sets">;
export type Exercises = Tables<"exercises">;
export type Followers = Tables<"followers">;
export type Messages = Tables<"messages">;
export type ProgramRestDays = Tables<"program_rest_days">;
export type ProgramTrainees = Tables<"program_trainees">;
export type ProgramWorkouts = Tables<"program_workouts">;
export type Programs = Tables<"programs">;
export type UserMetrics = Tables<"user_metrics">;
export type UserTags = Tables<"user_tags">;
export type Users = Tables<"users">;
export type Workouts = Tables<"workouts">;

// Additional useful type exports for better developer experience
export type UserInsert = TablesInsert<"users">;
export type UserUpdate = TablesUpdate<"users">;
