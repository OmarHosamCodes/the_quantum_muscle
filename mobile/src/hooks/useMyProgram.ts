import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Types for the program data
interface ProgramData {
	id: string;
	title: string;
	description: string;
	progress_percentage: number;
	current_week: number;
	total_weeks: number;
	next_workout: {
		id: string;
		title: string;
		description: string;
		exercises_count: number;
		estimated_duration: number;
	} | null;
	recent_workouts: Array<{
		id: string;
		title: string;
		completed_at: string;
		exercises_completed: number;
		total_exercises: number;
	}>;
}

// Fetch user's assigned program from Supabase
const fetchMyProgram = async (userId: string): Promise<ProgramData | null> => {
	// Get the user's assigned program
	const { data: programAssignment, error: assignmentError } = await supabase
		.from("program_trainees")
		.select(`
			program_id,
			joined_at,
			programs (
				id,
				name,
				trainer_id
			)
		`)
		.eq("trainee_id", userId)
		.order("joined_at", { ascending: false })
		.limit(1)
		.single();

	if (assignmentError) {
		if (assignmentError.code === "PGRST116") {
			// No program assigned
			return null;
		}
		throw new Error(`Failed to fetch program assignment: ${assignmentError.message}`);
	}

	if (!programAssignment?.programs) {
		return null;
	}

	const program = programAssignment.programs;

	// Get program workouts to calculate total weeks and find next workout
	const { data: programWorkouts, error: workoutsError } = await supabase
		.from("program_workouts")
		.select(`
			workout_id,
			workouts (
				id,
				name,
				image_url
			)
		`)
		.eq("program_id", program.id);

	if (workoutsError) {
		throw new Error(`Failed to fetch program workouts: ${workoutsError.message}`);
	}

	// For now, we'll use mock data for progress calculation and workout details
	// In a real implementation, you'd have tables to track workout completions,
	// program progress, and more detailed workout information
	
	const totalWorkouts = programWorkouts?.length || 8;
	const completedWorkouts = Math.floor(totalWorkouts * 0.375); // 37.5% progress
	const progressPercentage = (completedWorkouts / totalWorkouts) * 100;

	// Find next workout (for simplicity, we'll take the first workout)
	const nextWorkoutData = programWorkouts?.[0];
	
	return {
		id: program.id,
		title: program.name,
		description: `A comprehensive program created by your trainer`,
		progress_percentage: progressPercentage,
		current_week: Math.ceil(completedWorkouts / 2), // Assuming 2 workouts per week
		total_weeks: Math.ceil(totalWorkouts / 2),
		next_workout: nextWorkoutData?.workouts ? {
			id: nextWorkoutData.workouts.id,
			title: nextWorkoutData.workouts.name,
			description: "Build strength and improve fitness",
			exercises_count: 4, // Mock value
			estimated_duration: 50, // Mock value in minutes
		} : null,
		recent_workouts: [
			// Mock recent workouts - in a real app, you'd fetch from workout_sessions table
			{
				id: "1",
				title: "Upper Body Strength",
				completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
				exercises_completed: 4,
				total_exercises: 4,
			},
			{
				id: "2",
				title: "Lower Body Power",
				completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
				exercises_completed: 4,
				total_exercises: 4,
			},
		],
	};
};

export const useMyProgram = (userId?: string) => {
	return useQuery({
		queryKey: ["myProgram", userId],
		queryFn: () => fetchMyProgram(userId || ""),
		enabled: !!userId,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};
