import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { programService, workoutService } from "../lib/programService";

// Program hooks
export const useCreateProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: programService.createProgram,
		onSuccess: (_data, variables) => {
			// Invalidate trainer's programs
			queryClient.invalidateQueries({
				queryKey: ["trainerPrograms", variables.trainer_id],
			});
		},
	});
};

export const useTrainerPrograms = (trainerId: string) => {
	return useQuery({
		queryKey: ["trainerPrograms", trainerId],
		queryFn: () => programService.getTrainerPrograms(trainerId),
		enabled: !!trainerId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useAssignProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: programService.assignProgram,
		onSuccess: (_data, variables) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ["programTrainees", variables.program_id],
			});
			queryClient.invalidateQueries({
				queryKey: ["myProgram", variables.trainee_id],
			});
		},
	});
};

export const useUnassignProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			programId,
			traineeId,
		}: {
			programId: string;
			traineeId: string;
		}) => programService.unassignProgram(programId, traineeId),
		onSuccess: (_data, variables) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ["programTrainees", variables.programId],
			});
			queryClient.invalidateQueries({
				queryKey: ["myProgram", variables.traineeId],
			});
		},
	});
};

export const useProgramTrainees = (programId: string) => {
	return useQuery({
		queryKey: ["programTrainees", programId],
		queryFn: () => programService.getProgramTrainees(programId),
		enabled: !!programId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
};

export const useAddWorkoutToProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			programId,
			workoutId,
			orderIndex,
		}: {
			programId: string;
			workoutId: string;
			orderIndex?: number;
		}) => programService.addWorkoutToProgram(programId, workoutId, orderIndex),
		onSuccess: (_data, variables) => {
			// Invalidate program workouts
			queryClient.invalidateQueries({
				queryKey: ["programWorkouts", variables.programId],
			});
		},
	});
};

export const useRemoveWorkoutFromProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			programId,
			workoutId,
		}: {
			programId: string;
			workoutId: string;
		}) => programService.removeWorkoutFromProgram(programId, workoutId),
		onSuccess: (_data, variables) => {
			// Invalidate program workouts
			queryClient.invalidateQueries({
				queryKey: ["programWorkouts", variables.programId],
			});
		},
	});
};

export const useProgramWorkouts = (programId: string) => {
	return useQuery({
		queryKey: ["programWorkouts", programId],
		queryFn: () => programService.getProgramWorkouts(programId),
		enabled: !!programId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Workout hooks
export const useCreateWorkout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: workoutService.createWorkout,
		onSuccess: (_data, variables) => {
			// Invalidate user's workouts
			queryClient.invalidateQueries({
				queryKey: ["userWorkouts", variables.creator_id],
			});
		},
	});
};

export const useUserWorkouts = (userId: string) => {
	return useQuery({
		queryKey: ["userWorkouts", userId],
		queryFn: () => workoutService.getUserWorkouts(userId),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useWorkout = (workoutId: string) => {
	return useQuery({
		queryKey: ["workout", workoutId],
		queryFn: () => workoutService.getWorkout(workoutId),
		enabled: !!workoutId,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useUpdateWorkout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			workoutId,
			updates,
		}: {
			workoutId: string;
			updates: Partial<{ name: string; image_url?: string }>;
		}) => workoutService.updateWorkout(workoutId, updates),
		onSuccess: (data, variables) => {
			// Update the specific workout cache
			queryClient.setQueryData(["workout", variables.workoutId], data);
			// Invalidate user's workouts list
			queryClient.invalidateQueries({
				queryKey: ["userWorkouts", data.creator_id],
			});
		},
	});
};

export const useDeleteWorkout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			workoutId,
			userId,
		}: {
			workoutId: string;
			userId: string;
		}) => workoutService.deleteWorkout(workoutId, userId),
		onSuccess: (_data, variables) => {
			// Remove from cache
			queryClient.removeQueries({ queryKey: ["workout", variables.workoutId] });
			// Invalidate user's workouts list
			queryClient.invalidateQueries({
				queryKey: ["userWorkouts", variables.userId],
			});
		},
	});
};
