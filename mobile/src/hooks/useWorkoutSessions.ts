import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Types for workout session data
interface WorkoutSession {
	id: string;
	workout_id: string;
	user_id: string;
	completed_at: string;
	duration_minutes: number | null;
	workout: {
		id: string;
		name: string;
		image_url: string | null;
	};
	total_exercises: number;
	completed_exercises: number;
}

interface WorkoutStats {
	total_workouts: number;
	this_week_workouts: number;
	current_streak: number;
	total_duration_minutes: number;
	favorite_exercise: string | null;
}

// Fetch recent workout sessions for a user
const fetchRecentWorkoutSessions = async (
	userId: string,
	limit = 10,
): Promise<WorkoutSession[]> => {
	// Since we don't have a workout_sessions table yet, we'll simulate it by checking completed exercises
	// In a real implementation, you'd have a proper workout_sessions table

	// For now, let's get the user's recent workouts from exercises they've completed
	// This is a simplified approach - in reality you'd have a proper session tracking system

	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	// Get recent workouts that have exercises (as a proxy for completed workouts)
	const { data: workouts, error } = await supabase
		.from("workouts")
		.select(`
			id,
			name,
			image_url,
			created_at,
			creator_id,
			exercises (
				id,
				name,
				exercise_sets (
					id,
					reps,
					weight_kg
				)
			)
		`)
		.eq("creator_id", userId)
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) {
		throw new Error(`Failed to fetch workout sessions: ${error.message}`);
	}

	if (!workouts) {
		return [];
	}

	// Transform into session format
	return workouts.map((workout, index) => ({
		id: `session_${workout.id}_${index}`,
		workout_id: workout.id,
		user_id: userId,
		completed_at: new Date(
			Date.now() - index * 24 * 60 * 60 * 1000,
		).toISOString(), // Mock recent dates
		duration_minutes: 45 + Math.floor(Math.random() * 30), // Mock duration 45-75 mins
		workout: {
			id: workout.id,
			name: workout.name,
			image_url: workout.image_url,
		},
		total_exercises: workout.exercises?.length || 0,
		completed_exercises: workout.exercises?.length || 0,
	}));
};

// Fetch workout statistics for a user
const fetchWorkoutStats = async (userId: string): Promise<WorkoutStats> => {
	// Get user's workouts
	const { data: userWorkouts, error: workoutsError } = await supabase
		.from("workouts")
		.select(`
			id,
			created_at,
			exercises (
				id,
				target_muscle,
				exercise_sets (
					id
				)
			)
		`)
		.eq("creator_id", userId);

	if (workoutsError) {
		throw new Error(`Failed to fetch workout stats: ${workoutsError.message}`);
	}

	const totalWorkouts = userWorkouts?.length || 0;

	// Calculate this week's workouts (simplified)
	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	const thisWeekWorkouts =
		userWorkouts?.filter((w) => new Date(w.created_at || "") >= oneWeekAgo)
			.length || 0;

	// Find favorite exercise (most common target muscle)
	const muscleGroups: { [key: string]: number } = {};
	userWorkouts?.forEach((workout) => {
		workout.exercises?.forEach((exercise) => {
			muscleGroups[exercise.target_muscle] =
				(muscleGroups[exercise.target_muscle] || 0) + 1;
		});
	});

	const muscleGroupKeys = Object.keys(muscleGroups);
	const favoriteExercise =
		muscleGroupKeys.length > 0
			? muscleGroupKeys.reduce((a, b) =>
					muscleGroups[a] > muscleGroups[b] ? a : b,
				)
			: null;

	return {
		total_workouts: totalWorkouts,
		this_week_workouts: thisWeekWorkouts,
		current_streak: Math.min(totalWorkouts, 7), // Mock streak calculation
		total_duration_minutes: totalWorkouts * 55, // Mock average 55 min per workout
		favorite_exercise: favoriteExercise,
	};
};

// Hook for recent workout sessions
export const useRecentWorkoutSessions = (userId?: string, limit = 10) => {
	return useQuery({
		queryKey: ["recentWorkoutSessions", userId, limit],
		queryFn: () => fetchRecentWorkoutSessions(userId || "", limit),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Hook for workout statistics
export const useWorkoutStats = (userId?: string) => {
	return useQuery({
		queryKey: ["workoutStats", userId],
		queryFn: () => fetchWorkoutStats(userId || ""),
		enabled: !!userId,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};

// Hook for trainer's clients recent activity
export const useClientsRecentActivity = (trainerId?: string) => {
	return useQuery({
		queryKey: ["clientsRecentActivity", trainerId],
		queryFn: async () => {
			if (!trainerId) return [];

			// Get trainer's clients first
			const { data: programs } = await supabase
				.from("programs")
				.select("id")
				.eq("trainer_id", trainerId);

			if (!programs || programs.length === 0) return [];

			const programIds = programs.map((p) => p.id);

			// Get trainees from these programs
			const { data: trainees } = await supabase
				.from("program_trainees")
				.select(`
					trainee_id,
					users (
						id,
						name,
						profile_image_url
					)
				`)
				.in("program_id", programIds);

			if (!trainees) return [];

			// Get recent workouts for these trainees
			const traineeIds = trainees.map((t) => t.trainee_id);

			const { data: recentWorkouts } = await supabase
				.from("workouts")
				.select(`
					id,
					name,
					created_at,
					creator_id
				`)
				.in("creator_id", traineeIds)
				.order("created_at", { ascending: false })
				.limit(10);

			// Combine the data
			return (recentWorkouts || []).map((workout) => {
				const trainee = trainees.find(
					(t) => t.trainee_id === workout.creator_id,
				);
				return {
					id: workout.id,
					workout_name: workout.name,
					completed_at: workout.created_at,
					trainee: {
						id: trainee?.trainee_id || "",
						name: trainee?.users?.name || "Unknown",
						avatar_url: trainee?.users?.profile_image_url || null,
					},
				};
			});
		},
		enabled: !!trainerId,
		staleTime: 5 * 60 * 1000,
	});
};
