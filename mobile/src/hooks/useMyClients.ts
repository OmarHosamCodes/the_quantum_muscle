import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Types for client data
interface ClientData {
	id: string;
	name: string;
	avatar_url: string | null;
	user_type: "trainee" | "trainer";
	current_program: {
		id: string;
		title: string;
		progress_percentage: number;
	} | null;
	last_workout: {
		id: string;
		title: string;
		completed_at: string;
	} | null;
	is_online: boolean;
}

// Fetch trainer's clients from Supabase
const fetchMyClients = async (trainerId: string): Promise<ClientData[]> => {
	// Get all programs created by this trainer
	const { data: trainerPrograms, error: programsError } = await supabase
		.from("programs")
		.select("id, name")
		.eq("trainer_id", trainerId);

	if (programsError) {
		throw new Error(
			`Failed to fetch trainer programs: ${programsError.message}`,
		);
	}

	if (!trainerPrograms || trainerPrograms.length === 0) {
		return [];
	}

	// Get all trainees assigned to these programs
	const programIds = trainerPrograms.map((p) => p.id);

	const { data: programAssignments, error: assignmentsError } = await supabase
		.from("program_trainees")
		.select(`
			trainee_id,
			program_id,
			joined_at,
			programs (
				id,
				name
			),
			users (
				id,
				name,
				profile_image_url,
				user_type
			)
		`)
		.in("program_id", programIds);

	if (assignmentsError) {
		throw new Error(
			`Failed to fetch program assignments: ${assignmentsError.message}`,
		);
	}

	if (!programAssignments) {
		return [];
	}

	// Transform the data into the expected format
	const clientsMap = new Map<string, ClientData>();

	for (const assignment of programAssignments) {
		if (!assignment.users) continue;

		const clientId = assignment.users.id;
		const existingClient = clientsMap.get(clientId);

		// If this is the first program for this client, or a more recent one
		if (
			!existingClient ||
			(assignment.joined_at &&
				existingClient.current_program &&
				assignment.joined_at > existingClient.current_program.id)
		) {
			clientsMap.set(clientId, {
				id: assignment.users.id,
				name: assignment.users.name,
				avatar_url: assignment.users.profile_image_url,
				user_type: assignment.users.user_type,
				current_program: assignment.programs
					? {
							id: assignment.programs.id,
							title: assignment.programs.name,
							progress_percentage: Math.floor(Math.random() * 100), // Mock progress
						}
					: null,
				last_workout: {
					// Mock last workout data - in real app, fetch from workout_sessions
					id: "1",
					title: "Upper Body Strength",
					completed_at: new Date(
						Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
					).toISOString(),
				},
				is_online: Math.random() > 0.5, // Mock online status
			});
		}
	}

	return Array.from(clientsMap.values());
};

export const useMyClients = (trainerId?: string) => {
	return useQuery({
		queryKey: ["myClients", trainerId],
		queryFn: () => fetchMyClients(trainerId || ""),
		enabled: !!trainerId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
