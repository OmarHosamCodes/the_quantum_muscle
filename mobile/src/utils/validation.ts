export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (
	password: string,
): {
	isValid: boolean;
	errors: string[];
} => {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push("Password must be at least 8 characters long");
	}

	if (!/(?=.*[a-z])/.test(password)) {
		errors.push("Password must contain at least one lowercase letter");
	}

	if (!/(?=.*[A-Z])/.test(password)) {
		errors.push("Password must contain at least one uppercase letter");
	}

	if (!/(?=.*\d)/.test(password)) {
		errors.push("Password must contain at least one number");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

export const validateName = (name: string): boolean => {
	return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validatePasswordConfirmation = (
	password: string,
	confirmPassword: string,
): boolean => {
	return password === confirmPassword;
};

export const getPasswordStrength = (
	password: string,
): {
	score: number;
	feedback: string;
	color: string;
} => {
	let score = 0;

	if (password.length >= 8) score += 1;
	if (password.length >= 12) score += 1;
	if (/(?=.*[a-z])/.test(password)) score += 1;
	if (/(?=.*[A-Z])/.test(password)) score += 1;
	if (/(?=.*\d)/.test(password)) score += 1;
	if (/(?=.*[@$!%*?&])/.test(password)) score += 1;

	if (score <= 2) {
		return { score, feedback: "Weak", color: "#EF4444" };
	} else if (score <= 4) {
		return { score, feedback: "Fair", color: "#F59E0B" };
	} else if (score <= 5) {
		return { score, feedback: "Good", color: "#3B82F6" };
	} else {
		return { score, feedback: "Strong", color: "#10B981" };
	}
};
