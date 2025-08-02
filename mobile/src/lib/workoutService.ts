import { supabase } from "./supabase";

// Interfaces for workout details
export interface CompletedSet {
	set_number: number;
	reps: number;
	weight_kg: number;
	completed: boolean;
}

export interface WorkoutExercise {
	id: string;
	name: string;
	target_muscle: string;
	content_type: "image" | "video" | "text" | null;
	content_url: string | null;
	sets: number;
	reps: string;
	weight_kg: number;
	completed_sets: CompletedSet[];
}

export interface WorkoutDetails {
	id: string;
	name: string;
	description: string;
	duration_minutes: number;
	exercises: WorkoutExercise[];
}

export interface UpdateSetData {
	reps: number;
	weight_kg: number;
	completed: boolean;
}

export const workoutService = {
	// Get workout details with exercises and sets
	async getWorkoutDetails(workoutId: string): Promise<WorkoutDetails> {
		// Get workout basic info
		const { data: workout, error: workoutError } = await supabase
			.from("workouts")
			.select("id, name, image_url, created_at")
			.eq("id", workoutId)
			.single();

		if (workoutError) {
			throw new Error(`Failed to fetch workout: ${workoutError.message}`);
		}

		// Get exercises for this workout
		const { data: exercises, error: exercisesError } = await supabase
			.from("exercises")
			.select(`
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
			`)
			.eq("workout_id", workoutId)
			.order("created_at", { ascending: true });

		if (exercisesError) {
			throw new Error(`Failed to fetch exercises: ${exercisesError.message}`);
		}

		// Transform exercises to match the expected format
		const transformedExercises: WorkoutExercise[] = exercises.map(
			(exercise) => {
				const sets = exercise.exercise_sets || [];
				const maxSets =
					sets.length > 0 ? Math.max(...sets.map((s) => s.set_index)) + 1 : 3; // Default to 3 sets
				const avgWeight =
					sets.length > 0
						? sets.reduce((sum, set) => sum + (set.weight_kg || 0), 0) /
							sets.length
						: 0;
				const repsRange =
					sets.length > 0
						? `${Math.min(...sets.map((s) => s.reps || 0))}-${Math.max(...sets.map((s) => s.reps || 0))}`
						: "8-10";

				// Create completed sets array
				const completedSets: CompletedSet[] = [];
				for (let i = 0; i < maxSets; i++) {
					const existingSet = sets.find((s) => s.set_index === i);
					completedSets.push({
						set_number: i + 1,
						reps: existingSet?.reps || 0,
						weight_kg: existingSet?.weight_kg || avgWeight,
						completed: !!existingSet && (existingSet.reps || 0) > 0,
					});
				}

				return {
					id: exercise.id,
					name: exercise.name,
					target_muscle: exercise.target_muscle,
					content_type: exercise.content_type,
					content_url: exercise.content_url,
					sets: maxSets,
					reps: repsRange,
					weight_kg: avgWeight,
					completed_sets: completedSets,
				};
			},
		);

		return {
			id: workout.id,
			name: workout.name,
			description: `Workout created on ${new Date(workout.created_at || "").toLocaleDateString()}`,
			duration_minutes: 45, // Default duration
			exercises: transformedExercises,
		};
	},

	// Update a specific set completion
	async updateSetCompletion(
		exerciseId: string,
		setNumber: number,
		data: UpdateSetData,
	) {
		const setIndex = setNumber - 1; // Convert to 0-based index

		// First, check if a set record already exists
		const { data: existingSet, error: fetchError } = await supabase
			.from("exercise_sets")
			.select("id")
			.eq("exercise_id", exerciseId)
			.eq("set_index", setIndex)
			.single();

		if (fetchError && fetchError.code !== "PGRST116") {
			// PGRST116 = no rows returned
			throw new Error(`Failed to check existing set: ${fetchError.message}`);
		}

		if (existingSet) {
			// Update existing set
			const { error: updateError } = await supabase
				.from("exercise_sets")
				.update({
					reps: data.reps,
					weight_kg: data.weight_kg,
				})
				.eq("id", existingSet.id);

			if (updateError) {
				throw new Error(`Failed to update set: ${updateError.message}`);
			}
		} else {
			// Create new set record
			const { error: insertError } = await supabase
				.from("exercise_sets")
				.insert({
					exercise_id: exerciseId,
					set_index: setIndex,
					reps: data.reps,
					weight_kg: data.weight_kg,
				});

			if (insertError) {
				throw new Error(`Failed to create set: ${insertError.message}`);
			}
		}

		return { success: true };
	},

	// Complete the entire workout
	async completeWorkout(workoutId: string, userId: string) {
		// For now, we'll just log the completion
		// In a full implementation, you might want to:
		// 1. Create a workout_sessions table to track when workouts are completed
		// 2. Calculate workout statistics
		// 3. Update user progress

		console.log(
			`Workout ${workoutId} completed by user ${userId} at ${new Date().toISOString()}`,
		);
		return { success: true, completedAt: new Date().toISOString() };
	},

	// Get workout progress (completed sets vs total sets)
	async getWorkoutProgress(workoutId: string) {
		const { data: exercises, error } = await supabase
			.from("exercises")
			.select(`
				id,
				exercise_sets (
					reps,
					set_index
				)
			`)
			.eq("workout_id", workoutId);

		if (error) {
			throw new Error(`Failed to fetch workout progress: ${error.message}`);
		}

		let totalSets = 0;
		let completedSets = 0;

		exercises.forEach((exercise) => {
			const sets = exercise.exercise_sets || [];
			const maxSetIndex =
				sets.length > 0 ? Math.max(...sets.map((s) => s.set_index)) + 1 : 3;
			totalSets += maxSetIndex;

			sets.forEach((set) => {
				if (set.reps && set.reps > 0) {
					completedSets++;
				}
			});
		});

		return {
			totalSets,
			completedSets,
			percentage: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
		};
	},

	// Get all workouts for a user (from existing workoutService in programService.ts)
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

	// Create a new workout
	async createWorkout(workoutData: {
		name: string;
		creator_id: string;
		image_url?: string;
	}) {
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
};
