import { useQuery } from "@tanstack/react-query";

// Mock function to fetch trainer's clients
const fetchMyClients = async (trainerId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Mock data - in a real app, this would fetch from Supabase
	return [
		{
			id: "1",
			name: "Sarah Johnson",
			avatar_url: null,
			user_type: "trainee",
			current_program: {
				id: "1",
				title: "Beginner Strength",
				progress_percentage: 75,
			},
			last_workout: {
				id: "1",
				title: "Upper Body Strength",
				completed_at: "2024-01-15T10:30:00Z",
			},
			is_online: true,
		},
		{
			id: "2",
			name: "Mike Chen",
			avatar_url: null,
			user_type: "trainee",
			current_program: {
				id: "2",
				title: "Advanced Powerlifting",
				progress_percentage: 45,
			},
			last_workout: {
				id: "2",
				title: "Lower Body Power",
				completed_at: "2024-01-14T16:45:00Z",
			},
			is_online: false,
		},
		{
			id: "3",
			name: "Emma Davis",
			avatar_url: null,
			user_type: "trainee",
			current_program: {
				id: "3",
				title: "Cardio & Conditioning",
				progress_percentage: 90,
			},
			last_workout: {
				id: "3",
				title: "Full Body Conditioning",
				completed_at: "2024-01-15T08:20:00Z",
			},
			is_online: true,
		},
	];
};

export const useMyClients = (trainerId?: string) => {
	return useQuery({
		queryKey: ["myClients", trainerId],
		queryFn: () => fetchMyClients(trainerId || ""),
		enabled: !!trainerId,
	});
};
