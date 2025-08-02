import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type UpdateSetData, workoutService } from "../lib/workoutService";

export const useWorkout = (workoutId: string | undefined) => {
	const queryClient = useQueryClient();

	// Get workout details
	const workoutQuery = useQuery({
		queryKey: ["workout", workoutId],
		queryFn: () => {
			if (!workoutId) throw new Error("No workout ID provided");
			return workoutService.getWorkoutDetails(workoutId);
		},
		enabled: !!workoutId,
	});

	// Update set completion
	const updateSetMutation = useMutation({
		mutationFn: ({
			exerciseId,
			setNumber,
			data,
		}: {
			exerciseId: string;
			setNumber: number;
			data: UpdateSetData;
		}) => workoutService.updateSetCompletion(exerciseId, setNumber, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
		},
	});

	// Complete workout
	const completeWorkoutMutation = useMutation({
		mutationFn: ({ userId }: { userId: string }) => {
			if (!workoutId) throw new Error("No workout ID provided");
			return workoutService.completeWorkout(workoutId, userId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
		},
	});

	// Add exercise to workout
	const addExerciseMutation = useMutation({
		mutationFn: (exerciseData: {
			name: string;
			target_muscle: string;
			content_type?: "image" | "video" | "text" | null;
			content_url?: string;
		}) => {
			if (!workoutId) throw new Error("No workout ID provided");
			return workoutService.addExerciseToWorkout({
				...exerciseData,
				workout_id: workoutId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
		},
	});

	// Remove exercise from workout
	const removeExerciseMutation = useMutation({
		mutationFn: (exerciseId: string) =>
			workoutService.removeExerciseFromWorkout(exerciseId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
		},
	});

	// Get workout progress
	const progressQuery = useQuery({
		queryKey: ["workout-progress", workoutId],
		queryFn: () => {
			if (!workoutId) throw new Error("No workout ID provided");
			return workoutService.getWorkoutProgress(workoutId);
		},
		enabled: !!workoutId,
	});

	return {
		// Workout data
		workout: workoutQuery.data,
		isLoading: workoutQuery.isLoading,
		error: workoutQuery.error,

		// Progress data
		progress: progressQuery.data,
		isProgressLoading: progressQuery.isLoading,

		// Mutations
		updateSet: updateSetMutation.mutate,
		isUpdatingSet: updateSetMutation.isPending,

		completeWorkout: completeWorkoutMutation.mutate,
		isCompletingWorkout: completeWorkoutMutation.isPending,

		addExercise: addExerciseMutation.mutate,
		isAddingExercise: addExerciseMutation.isPending,

		removeExercise: removeExerciseMutation.mutate,
		isRemovingExercise: removeExerciseMutation.isPending,

		// Refetch
		refetch: workoutQuery.refetch,
	};
};
