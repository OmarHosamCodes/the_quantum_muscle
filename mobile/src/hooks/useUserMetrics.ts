import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Types for user metrics
interface UserMetric {
	id: number;
	user_id: string | null;
	weight_kg: number | null;
	height_cm: number | null;
	date_recorded: string | null;
}

interface MetricsStats {
	current_weight: number | null;
	weight_change_this_month: number;
	current_height: number | null;
	bmi: number | null;
	total_entries: number;
	first_entry_date: string | null;
}

// Fetch user metrics
const fetchUserMetrics = async (userId: string): Promise<UserMetric[]> => {
	const { data, error } = await supabase
		.from("user_metrics")
		.select("*")
		.eq("user_id", userId)
		.order("date_recorded", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch user metrics: ${error.message}`);
	}

	return data || [];
};

// Fetch metrics statistics
const fetchMetricsStats = async (userId: string): Promise<MetricsStats> => {
	const { data: metrics, error } = await supabase
		.from("user_metrics")
		.select("*")
		.eq("user_id", userId)
		.order("date_recorded", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch metrics stats: ${error.message}`);
	}

	if (!metrics || metrics.length === 0) {
		return {
			current_weight: null,
			weight_change_this_month: 0,
			current_height: null,
			bmi: null,
			total_entries: 0,
			first_entry_date: null,
		};
	}

	const currentMetric = metrics[0];
	const currentWeight = currentMetric.weight_kg;
	const currentHeight = currentMetric.height_cm;

	// Calculate weight change this month
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

	const lastMonthMetric = metrics.find(
		(m) =>
			new Date(m.date_recorded || "") <= oneMonthAgo && m.weight_kg !== null,
	);

	const weightChangeThisMonth =
		lastMonthMetric && currentWeight && lastMonthMetric.weight_kg
			? currentWeight - lastMonthMetric.weight_kg
			: 0;

	// Calculate BMI
	const bmi =
		currentWeight && currentHeight
			? currentWeight / (currentHeight / 100) ** 2
			: null;

	return {
		current_weight: currentWeight,
		weight_change_this_month: weightChangeThisMonth,
		current_height: currentHeight,
		bmi: bmi ? Math.round(bmi * 10) / 10 : null,
		total_entries: metrics.length,
		first_entry_date: metrics[metrics.length - 1]?.date_recorded || null,
	};
};

// Add new metric entry
const addUserMetric = async (data: {
	user_id: string;
	weight_kg?: number;
	height_cm?: number;
	date_recorded?: string;
}) => {
	const { data: result, error } = await supabase
		.from("user_metrics")
		.insert({
			user_id: data.user_id,
			weight_kg: data.weight_kg || null,
			height_cm: data.height_cm || null,
			date_recorded: data.date_recorded || new Date().toISOString(),
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to add user metric: ${error.message}`);
	}

	return result;
};

// Hook for user metrics
export const useUserMetrics = (userId?: string) => {
	return useQuery({
		queryKey: ["userMetrics", userId],
		queryFn: () => fetchUserMetrics(userId || ""),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Hook for metrics statistics
export const useMetricsStats = (userId?: string) => {
	return useQuery({
		queryKey: ["metricsStats", userId],
		queryFn: () => fetchMetricsStats(userId || ""),
		enabled: !!userId,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};

// Hook for adding metrics
export const useAddUserMetric = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: addUserMetric,
		onSuccess: (data) => {
			// Invalidate and refetch user metrics
			queryClient.invalidateQueries({
				queryKey: ["userMetrics", data.user_id],
			});
			queryClient.invalidateQueries({
				queryKey: ["metricsStats", data.user_id],
			});
		},
	});
};
