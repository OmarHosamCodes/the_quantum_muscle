import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type React from "react";
import { Text, View } from "react-native";
import "../global.css";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { useAuth } from "./hooks/useAuth";
import { AuthScreenWithZod } from "./screens/AuthScreenWithZod";

export const App: React.FC = () => {
	const { loading, isAuthenticated, user, session, initialized } = useAuth();

	try {
		console.log("App render state:", {
			loading,
			isAuthenticated,
			hasUser: !!user,
			hasSession: !!session,
			initialized,
		});

		// Show loading screen while auth is initializing
		if (loading || !initialized) {
			return <LoadingScreen message="Initializing..." />;
		}

		// If authenticated, redirect to the main app with tab navigation
		if (isAuthenticated) {
			return <Redirect href="/(tabs)/dashboard" />;
		}

		return (
			<>
				<StatusBar style="auto" />
				<AuthScreenWithZod />
			</>
		);
	} catch (error) {
		console.error("App error:", error);
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					padding: 20,
				}}
			>
				<Text style={{ color: "red", textAlign: "center", marginBottom: 20 }}>
					App Error: {error instanceof Error ? error.message : "Unknown error"}
				</Text>
				<AuthScreenWithZod />
			</View>
		);
	}
};
