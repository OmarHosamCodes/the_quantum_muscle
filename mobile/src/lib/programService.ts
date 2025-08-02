import { supabase } from "./supabase";

// Types for program operations
export interface CreateProgramData {
	name: string;
	trainer_id: string;
}

export interface AssignProgramData {
	program_id: string;
	trainee_id: string;
}

export interface CreateWorkoutData {
	name: string;
	creator_id: string;
	image_url?: string;
}

// Interfaces for getProgramWorkouts function output
export interface ExerciseSet {
	id: number;
	reps: number | null;
	weight_kg: number | null;
	set_index: number;
}

export interface Exercise {
	id: string;
	name: string;
	target_muscle: string;
	content_type: "image" | "video" | "text" | null;
	content_url: string | null;
	exercise_sets: ExerciseSet[];
}

export interface ProgramWorkout {
	id: string;
	name: string;
	image_url: string | null;
	created_at: string | null;
	creator_id: string | null;
	exercises: Exercise[];
	order_index: number;
}

// Program service functions
export const programService = {
	// Create a new program
	async createProgram(programData: CreateProgramData) {
		const { data, error } = await supabase
			.from("programs")
			.insert({
				name: programData.name,
				trainer_id: programData.trainer_id,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to create program: ${error.message}`);
		}

		return data;
	},

	// Get all programs created by a trainer
	async getTrainerPrograms(trainerId: string) {
		const { data, error } = await supabase
			.from("programs")
			.select(`
				id,
				name,
				created_at,
				trainer_id
			`)
			.eq("trainer_id", trainerId)
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(`Failed to fetch trainer programs: ${error.message}`);
		}

		return data;
	},

	// Get a single program by ID
	async getProgram(programId: string) {
		const { data, error } = await supabase
			.from("programs")
			.select(`
				id,
				name,
				created_at,
				trainer_id
			`)
			.eq("id", programId)
			.single();

		if (error) {
			throw new Error(`Failed to fetch program: ${error.message}`);
		}

		return data;
	},

	// Assign a program to a trainee
	async assignProgram(assignmentData: AssignProgramData) {
		// Check if the trainee is already assigned to this program
		const { data: existingAssignment, error: checkError } = await supabase
			.from("program_trainees")
			.select("program_id")
			.eq("program_id", assignmentData.program_id)
			.eq("trainee_id", assignmentData.trainee_id)
			.single();

		if (checkError && checkError.code !== "PGRST116") {
			throw new Error(
				`Failed to check program assignment: ${checkError.message}`,
			);
		}

		if (existingAssignment) {
			throw new Error("Trainee is already assigned to this program");
		}

		const { data, error } = await supabase
			.from("program_trainees")
			.insert({
				program_id: assignmentData.program_id,
				trainee_id: assignmentData.trainee_id,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to assign program: ${error.message}`);
		}

		return data;
	},

	// Remove a trainee from a program
	async unassignProgram(programId: string, traineeId: string) {
		const { error } = await supabase
			.from("program_trainees")
			.delete()
			.eq("program_id", programId)
			.eq("trainee_id", traineeId);

		if (error) {
			throw new Error(`Failed to unassign program: ${error.message}`);
		}

		return { success: true };
	},

	// Get all trainees assigned to a program
	async getProgramTrainees(programId: string) {
		const { data, error } = await supabase
			.from("program_trainees")
			.select(`
				trainee_id,
				joined_at,
				trainee:users!program_trainees_trainee_id_fkey (
					id,
					name,
					email,
					profile_image_url,
					user_type
				)
			`)
			.eq("program_id", programId);

		if (error) {
			throw new Error(`Failed to fetch program trainees: ${error.message}`);
		}

		return data
			.map((item) => ({
				...item.trainee,
				joined_at: item.joined_at,
			}))
			.filter(Boolean);
	},

	// Add a workout to a program
	async addWorkoutToProgram(
		programId: string,
		workoutId: string,
		orderIndex: number = 0,
	) {
		const { data, error } = await supabase
			.from("program_workouts")
			.insert({
				program_id: programId,
				workout_id: workoutId,
				order_index: orderIndex,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to add workout to program: ${error.message}`);
		}

		return data;
	},

	// Remove a workout from a program
	async removeWorkoutFromProgram(programId: string, workoutId: string) {
		const { error } = await supabase
			.from("program_workouts")
			.delete()
			.eq("program_id", programId)
			.eq("workout_id", workoutId);

		if (error) {
			throw new Error(
				`Failed to remove workout from program: ${error.message}`,
			);
		}

		return { success: true };
	},

	// Get all workouts in a program with exercises and sets
	async getProgramWorkouts(programId: string): Promise<ProgramWorkout[]> {
		const { data, error } = await supabase
			.from("program_workouts")
			.select(`
				workout_id,
				order_index,
				workout:workouts!program_workouts_workout_id_fkey (
					id,
					name,
					image_url,
					created_at,
					creator_id,
					exercises (
						id,
						name,
						target_muscle,
						content_type,
						content_url,
						exercise_sets (
							id,
							reps,
							weight_kg,
							set_index
						)
					)
				)
			`)
			.eq("program_id", programId)
			.order("order_index", { ascending: true });

		if (error) {
			throw new Error(`Failed to fetch program workouts: ${error.message}`);
		}

		return data
			.map((item) => ({
				...item.workout,
				order_index: item.order_index,
			}))
			.filter((item) => item.id);
	},
};

// Workout service functions
export const workoutService = {
	// Create a new workout
	async createWorkout(workoutData: CreateWorkoutData) {
		const { data, error } = await supabase
			.from("workouts")
			.insert({
				name: workoutData.name,
				creator_id: workoutData.creator_id,
				image_url: workoutData.image_url,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to create workout: ${error.message}`);
		}

		return data;
	},

	// Get all workouts created by a user
	async getUserWorkouts(userId: string) {
		const { data, error } = await supabase
			.from("workouts")
			.select("*")
			.eq("creator_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(`Failed to fetch user workouts: ${error.message}`);
		}

		return data;
	},

	// Get a specific workout
	async getWorkout(workoutId: string) {
		const { data, error } = await supabase
			.from("workouts")
			.select("*")
			.eq("id", workoutId)
			.single();

		if (error) {
			throw new Error(`Failed to fetch workout: ${error.message}`);
		}

		return data;
	},

	// Update a workout
	async updateWorkout(workoutId: string, updates: Partial<CreateWorkoutData>) {
		const { data, error } = await supabase
			.from("workouts")
			.update(updates)
			.eq("id", workoutId)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to update workout: ${error.message}`);
		}

		return data;
	},

	// Delete a workout
	async deleteWorkout(workoutId: string, userId: string) {
		// First verify the user owns this workout
		const { data: workout, error: fetchError } = await supabase
			.from("workouts")
			.select("creator_id")
			.eq("id", workoutId)
			.single();

		if (fetchError) {
			throw new Error(`Failed to fetch workout: ${fetchError.message}`);
		}

		if (workout.creator_id !== userId) {
			throw new Error("You can only delete your own workouts");
		}

		const { error } = await supabase
			.from("workouts")
			.delete()
			.eq("id", workoutId);

		if (error) {
			throw new Error(`Failed to delete workout: ${error.message}`);
		}

		return { success: true };
	},
};
