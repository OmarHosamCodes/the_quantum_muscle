import { z } from "zod";

// Base schemas
export const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Please enter a valid email address");

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
	.regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
	.regex(/(?=.*\d)/, "Password must contain at least one number");

export const nameSchema = z
	.string()
	.min(2, "Name must be at least 2 characters long")
	.max(50, "Name must be less than 50 characters")
	.trim();

export const userTypeSchema = z.enum(["trainee", "trainer"], {
	message: "Please select a valid user type",
});

// Auth form schemas
export const signInSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
	.object({
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string(),
		name: nameSchema,
		userType: userTypeSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const resetPasswordSchema = z.object({
	email: emailSchema,
});

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// User schema - updated to match database structure
export const userSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	name: z.string(),
	profile_image_url: z.string().url().nullable().optional(),
	user_type: userTypeSchema,
	rat_id: z.string(),
	age: z.number().nullable().optional(),
	bio: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	follower_count: z.number().nullable().optional(),
	following_count: z.number().nullable().optional(),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

// Password strength utility
export const getPasswordStrength = (password: string) => {
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
