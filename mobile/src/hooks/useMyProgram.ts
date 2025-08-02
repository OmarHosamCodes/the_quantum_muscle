import { useQuery } from "@tanstack/react-query";

// Mock function to fetch user's assigned program
const fetchMyProgram = async (userId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Mock data - in a real app, this would fetch from Supabase
	return {
		id: "1",
		title: "Beginner Strength",
		description: "A comprehensive 8-week program designed for beginners",
		progress_percentage: 37.5,
		current_week: 3,
		total_weeks: 8,
		next_workout: {
			id: "2",
			title: "Lower Body Power",
			description: "Build strength in legs and core",
			exercises_count: 4,
			estimated_duration: 50,
		},
		recent_workouts: [
			{
				id: "1",
				title: "Upper Body Strength",
				completed_at: "2024-01-15T10:30:00Z",
				exercises_completed: 4,
				total_exercises: 4,
			},
			{
				id: "3",
				title: "Full Body Conditioning",
				completed_at: "2024-01-13T09:15:00Z",
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
	});
};
