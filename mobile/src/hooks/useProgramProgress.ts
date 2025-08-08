import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Types for program progress
interface ProgramProgress {
	program_id: string;
	user_id: string;
	total_workouts: number;
	completed_workouts: number;
	completion_percentage: number;
	current_week: number;
	total_weeks: number;
	last_workout_date: string | null;
	next_workout: {
		id: string;
		name: string;
		estimated_duration: number;
		exercises_count: number;
	} | null;
	weekly_stats: Array<{
		week: number;
		completed_workouts: number;
		total_workouts: number;
	}>;
}

// Calculate program progress for a user
const fetchProgramProgress = async (
	userId: string,
): Promise<ProgramProgress | null> => {
	// Get user's current program
	const { data: programAssignment, error: assignmentError } = await supabase
		.from("program_trainees")
		.select(`
			program_id,
			joined_at,
			programs (
				id,
				name,
				program_workouts (
					order_index,
					workouts (
						id,
						name,
						exercises (
							id
						)
					)
				)
			)
		`)
		.eq("trainee_id", userId)
		.order("joined_at", { ascending: false })
		.limit(1)
		.single();

	if (assignmentError || !programAssignment?.programs) {
		return null;
	}

	const program = programAssignment.programs;
	const programWorkouts = program.program_workouts || [];
	const totalWorkouts = programWorkouts.length;

	// For now, simulate completion data since we don't have workout session tracking
	// In a real app, you'd check actual workout completions from a workout_sessions table

	// Mock completion data based on user activity
	const completedWorkouts = Math.floor(totalWorkouts * 0.4); // 40% completion
	const completionPercentage =
		totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

	// Calculate weeks (assuming 3 workouts per week)
	const workoutsPerWeek = 3;
	const totalWeeks = Math.ceil(totalWorkouts / workoutsPerWeek);
	const currentWeek = Math.ceil(completedWorkouts / workoutsPerWeek) || 1;

	// Find next workout
	const nextWorkoutIndex = completedWorkouts;
	const nextWorkout = programWorkouts[nextWorkoutIndex]?.workouts || null;

	// Calculate weekly stats
	const weeklyStats = [];
	for (let week = 1; week <= totalWeeks; week++) {
		const weekStartIndex = (week - 1) * workoutsPerWeek;
		const weekEndIndex = Math.min(
			weekStartIndex + workoutsPerWeek,
			totalWorkouts,
		);
		const weekTotalWorkouts = weekEndIndex - weekStartIndex;
		const weekCompletedWorkouts = Math.max(
			0,
			Math.min(completedWorkouts - weekStartIndex, weekTotalWorkouts),
		);

		weeklyStats.push({
			week,
			completed_workouts: weekCompletedWorkouts,
			total_workouts: weekTotalWorkouts,
		});
	}

	return {
		program_id: program.id,
		user_id: userId,
		total_workouts: totalWorkouts,
		completed_workouts: completedWorkouts,
		completion_percentage: Math.round(completionPercentage),
		current_week: currentWeek,
		total_weeks: totalWeeks,
		last_workout_date:
			completedWorkouts > 0
				? new Date(
						Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000,
					).toISOString() // Mock recent date
				: null,
		next_workout: nextWorkout
			? {
					id: nextWorkout.id,
					name: nextWorkout.name,
					estimated_duration: 45 + Math.floor(Math.random() * 30), // 45-75 mins
					exercises_count: nextWorkout.exercises?.length || 0,
				}
			: null,
		weekly_stats: weeklyStats,
	};
};

// Hook for program progress
export const useProgramProgress = (userId?: string) => {
	return useQuery({
		queryKey: ["programProgress", userId],
		queryFn: () => fetchProgramProgress(userId || ""),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Types and hooks for trainer dashboard data
interface TrainerDashboardStats {
	total_clients: number;
	active_clients: number;
	total_programs: number;
	total_workouts_created: number;
	this_week_client_workouts: number;
	completion_rate: number;
}

// Fetch trainer dashboard statistics
const fetchTrainerDashboardStats = async (
	trainerId: string,
): Promise<TrainerDashboardStats> => {
	// Get trainer's programs
	const { data: programs } = await supabase
		.from("programs")
		.select("id")
		.eq("trainer_id", trainerId);

	const totalPrograms = programs?.length || 0;
	const programIds = programs?.map((p) => p.id) || [];

	// Get total clients (trainees assigned to trainer's programs)
	const { data: clients } = await supabase
		.from("program_trainees")
		.select("trainee_id")
		.in("program_id", programIds);

	const uniqueClients = new Set(clients?.map((c) => c.trainee_id) || []);
	const totalClients = uniqueClients.size;

	// Get trainer's created workouts
	const { data: workouts } = await supabase
		.from("workouts")
		.select("id, created_at")
		.eq("creator_id", trainerId);

	const totalWorkoutsCreated = workouts?.length || 0;

	// Calculate this week's activity (mock data)
	const thisWeekClientWorkouts = Math.floor(totalClients * 2.5); // Mock: avg 2.5 workouts per client this week
	const completionRate = 78; // Mock completion rate

	return {
		total_clients: totalClients,
		active_clients: Math.floor(totalClients * 0.8), // 80% active
		total_programs: totalPrograms,
		total_workouts_created: totalWorkoutsCreated,
		this_week_client_workouts: thisWeekClientWorkouts,
		completion_rate: completionRate,
	};
};

// Hook for trainer dashboard statistics
export const useTrainerDashboardStats = (trainerId?: string) => {
	return useQuery({
		queryKey: ["trainerDashboardStats", trainerId],
		queryFn: () => fetchTrainerDashboardStats(trainerId || ""),
		enabled: !!trainerId,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};
