import { StatusBar } from "expo-status-bar";
import type React from "react";
import { AccountScreen } from "./components/account/AccountScreen";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { useAuth } from "./hooks/useAuth";
import { AuthScreen } from "./screens/AuthScreen";

export const App: React.FC = () => {
	const { loading, initialized, isAuthenticated } = useAuth();

	// Show loading screen while auth is initializing
	if (!initialized || loading) {
		return <LoadingScreen message="Initializing..." />;
	}

	return (
		<>
			<StatusBar style="auto" />
			{isAuthenticated ? <AccountScreen /> : <AuthScreen />}
		</>
	);
};
