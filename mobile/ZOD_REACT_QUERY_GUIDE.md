# Zod and TanStack React Query Integration

This document outlines the implementation of Zod for validation and TanStack React Query for data fetching in the Quantum Muscle mobile app.

## 🎯 Overview

The app now uses:
- **Zod** for runtime type validation and form schema definition
- **TanStack React Query** for efficient data fetching, caching, and state management
- **TypeScript** integration for type safety

## 📋 Features Added

### Zod Validation
- ✅ Type-safe form validation schemas
- ✅ Runtime validation with user-friendly error messages
- ✅ Password strength validation
- ✅ Email format validation
- ✅ Name length validation
- ✅ Password confirmation matching

### TanStack React Query
- ✅ Optimized data fetching and caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Error handling and retry logic
- ✅ Loading states management
- ✅ Cache invalidation strategies

## 🔧 Implementation

### Schema Definitions (`src/schemas/auth.ts`)

```typescript
import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain at least one number');

// Sign up form schema with password confirmation
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: nameSchema,
    userType: userTypeSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Type inference
export type SignUpFormData = z.infer<typeof signUpSchema>;
```

### Query Client Configuration (`src/lib/queryClient.ts`)

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### Auth Hooks with React Query (`src/hooks/useAuthQuery.ts`)

```typescript
// Sign in mutation
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignInFormData) => {
      const { data, error } = await authService.signIn(credentials.email, credentials.password);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};

// Combined auth state
export const useAuth = () => {
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: user, isLoading: userLoading } = useUser();

  return {
    user,
    session,
    loading: sessionLoading || userLoading,
    isAuthenticated: !!session && !!user,
  };
};
```

### Form Components with Zod Validation

The new form components (`SignInFormWithZod`, `SignUpFormWithZod`, `ForgotPasswordFormWithZod`) use Zod schemas for validation:

```typescript
const validateForm = (): boolean => {
  try {
    signInSchema.parse(formData);
    setErrors({});
    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      const newErrors: Partial<Record<keyof SignInFormData, string>> = {};
      
      error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          const field = issue.path[0] as keyof SignInFormData;
          newErrors[field] = issue.message;
        }
      });
      
      setErrors(newErrors);
    }
    return false;
  }
};
```

## 🚀 Usage Examples

### Form Validation
```typescript
import { signInSchema, type SignInFormData } from '../schemas/auth';

const [formData, setFormData] = useState<SignInFormData>({
  email: "",
  password: "",
});

// Validate form data
const result = signInSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
  console.log(result.error.issues);
}
```

### Data Fetching with React Query
```typescript
import { useSignIn } from '../hooks/useAuthQuery';

const LoginComponent = () => {
  const signInMutation = useSignIn();

  const handleLogin = async (credentials: SignInFormData) => {
    try {
      await signInMutation.mutateAsync(credentials);
      // Success handled automatically by React Query
    } catch (error) {
      // Handle error
      console.error('Login failed:', error);
    }
  };

  return (
    <Button 
      onPress={() => handleLogin(formData)}
      loading={signInMutation.isPending}
      disabled={signInMutation.isPending}
    />
  );
};
```

### Profile Management with Optimistic Updates
```typescript
import { useUpdateProfileOptimistic } from '../hooks/useProfile';

const ProfileComponent = () => {
  const updateProfile = useUpdateProfileOptimistic();

  const handleUpdateName = async (newName: string) => {
    updateProfile.mutate({
      userId: user.id,
      updates: { name: newName }
    });
    // UI updates immediately, rolls back on error
  };
};
```

## 📁 File Structure

```
src/
├── schemas/
│   └── auth.ts              # Zod validation schemas
├── hooks/
│   ├── useAuthQuery.ts      # React Query auth hooks
│   ├── useProfile.ts        # Profile management hooks
│   └── useAuth.ts           # Legacy auth hook (deprecated)
├── lib/
│   └── queryClient.ts       # React Query configuration
├── components/auth/
│   ├── SignInFormWithZod.tsx
│   ├── SignUpFormWithZod.tsx
│   └── ForgotPasswordFormWithZod.tsx
└── screens/
    └── AuthScreenWithZod.tsx
```

## 🔄 Migration Guide

### From Legacy Forms to Zod Forms

1. **Replace imports:**
   ```typescript
   // Old
   import { SignInForm } from '../components/auth/SignInForm';
   
   // New
   import { SignInFormWithZod } from '../components/auth/SignInFormWithZod';
   ```

2. **Update validation:**
   ```typescript
   // Old
   import { validateEmail, validatePassword } from '../utils/validation';
   
   // New
   import { signInSchema } from '../schemas/auth';
   ```

3. **Use React Query hooks:**
   ```typescript
   // Old
   import { useAuth } from '../hooks/useAuth';
   
   // New
   import { useAuth } from '../hooks/useAuthQuery';
   ```

## 🎯 Benefits

### Better Developer Experience
- **Type Safety**: Automatic TypeScript types from Zod schemas
- **Runtime Validation**: Catch validation errors at runtime
- **Better Error Messages**: User-friendly validation feedback

### Improved Performance
- **Smart Caching**: React Query automatically caches API responses
- **Background Updates**: Data stays fresh without blocking UI
- **Optimistic Updates**: Instant UI feedback with rollback on errors

### Enhanced UX
- **Loading States**: Built-in loading state management
- **Error Handling**: Consistent error handling across the app
- **Offline Support**: React Query provides built-in offline capabilities

## 🔧 Dependencies Added

```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0"
  }
}
```

## 🚦 Next Steps

1. **Migrate remaining forms** to use Zod validation
2. **Add more query hooks** for workout data, nutrition tracking, etc.
3. **Implement offline sync** using React Query's built-in capabilities
4. **Add React Query DevTools** in development for debugging
5. **Create reusable validation schemas** for other data types
6. **Implement infinite queries** for paginated data lists

## 📚 Additional Resources

- [Zod Documentation](https://zod.dev/)
- [TanStack React Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://react-query.tanstack.com/guides/best-practices)
