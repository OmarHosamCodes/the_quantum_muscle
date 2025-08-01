# Quantum Muscle - Authentication System

A comprehensive, scalable authentication system built with React Native, Expo, and Supabase.

## 🚀 Features

### Authentication
- **Sign In**: Email/password authentication with validation
- **Sign Up**: User registration with role selection (Trainee/Trainer)
- **Password Reset**: Email-based password recovery
- **Auto-refresh**: Automatic token refresh and session management
- **Persistent Sessions**: Users stay logged in across app restarts

### User Experience
- **Real-time Validation**: Form validation with immediate feedback
- **Password Strength**: Visual password strength indicator
- **Loading States**: Clear loading indicators for all actions
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works across different screen sizes
- **Accessibility**: WCAG compliant components

### Security
- **Password Requirements**: Enforced strong password policies
- **Email Validation**: Proper email format validation
- **Secure Storage**: Encrypted session storage
- **Auto-logout**: Automatic session cleanup

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/                    # Authentication components
│   │   ├── AuthContainer.tsx    # Auth layout wrapper
│   │   ├── SignInForm.tsx       # Sign in form
│   │   ├── SignUpForm.tsx       # Registration form
│   │   └── ForgotPasswordForm.tsx # Password reset form
│   ├── account/                 # Account management
│   │   └── AccountScreen.tsx    # User profile screen
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx           # Custom button component
│       ├── Input.tsx            # Custom input component
│       ├── LoadingScreen.tsx    # Loading screen
│       └── PasswordStrengthIndicator.tsx
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── lib/
│   └── supabase.ts             # Supabase client & auth service
├── screens/
│   └── AuthScreen.tsx          # Main auth screen router
├── types/
│   └── auth.ts                 # TypeScript types
├── utils/
│   └── validation.ts           # Validation utilities
├── constants/
│   ├── theme.ts                # Design system constants
│   └── layout.ts               # Layout constants
└── App.tsx                     # Main app component
```

## 🛠 Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account

### Installation

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```

3. **Supabase configuration**:
   - Enable email authentication in Supabase dashboard
   - Configure email templates (optional)
   - Set up RLS policies for user data

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 🎨 Design System

### Colors
- **Primary**: Indigo (`#6366F1`)
- **Secondary**: Emerald (`#10B981`)
- **Accent**: Amber (`#F59E0B`)
- **Error**: Red (`#EF4444`)

### Typography
- **Sizes**: xs(12) to 5xl(48)
- **Weights**: light(300) to extrabold(800)
- **Consistent line heights**

### Spacing
- **Scale**: xs(4px) to xxxl(64px)
- **Consistent margins and padding**

## 🔧 Components

### useAuth Hook
```tsx
const { 
  user, 
  loading, 
  isAuthenticated, 
  signIn, 
  signUp, 
  signOut, 
  resetPassword 
} = useAuth();
```

### Button Component
```tsx
<Button
  title="Sign In"
  variant="primary" // primary | secondary | outline | ghost
  size="medium"     // small | medium | large
  onPress={handlePress}
  loading={false}
  disabled={false}
  fullWidth={true}
/>
```

### Input Component
```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  placeholder="Enter your email"
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  required
/>
```

## 🔐 Authentication Flow

### Sign In
1. User enters email/password
2. Form validation (client-side)
3. Supabase authentication
4. Session storage
5. Redirect to main app

### Sign Up
1. User enters details + role selection
2. Password strength validation
3. Create account via Supabase
4. Email verification sent
5. User confirmation required

### Password Reset
1. User enters email
2. Reset link sent via email
3. User clicks link (external)
4. Password update in app

## 🧪 Validation Rules

### Email
- Valid email format required
- Case-insensitive

### Password
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### Name
- 2-50 characters
- Required for registration

## 🚨 Error Handling

### Network Errors
- Automatic retry on network failure
- Offline state handling
- User-friendly error messages

### Validation Errors
- Real-time field validation
- Clear error messaging
- Form submission prevention

### Auth Errors
- Supabase error mapping
- Contextual error messages
- Recovery suggestions

## 📱 Platform Support

- **iOS**: Full support with native feel
- **Android**: Material Design compliance
- **Web**: Responsive design (via Expo)

## 🔄 State Management

### Auth State
- User object
- Session data
- Loading states
- Error states

### Form State
- Field values
- Validation errors
- Submission state

## 🎯 Best Practices

### Security
- Never store sensitive data in AsyncStorage
- Use secure communication (HTTPS)
- Implement proper session management
- Follow OWASP guidelines

### Performance
- Lazy load screens
- Optimize images
- Minimize re-renders
- Cache static data

### UX
- Provide immediate feedback
- Clear loading states
- Graceful error handling
- Consistent navigation

## 🔮 Future Enhancements

- [ ] Biometric authentication (Touch/Face ID)
- [ ] Social login (Google, Apple, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Password strength requirements customization
- [ ] Account linking
- [ ] Advanced profile management
- [ ] Session management dashboard
- [ ] Login activity tracking

## 📚 Dependencies

### Core
- React Native
- Expo
- @supabase/supabase-js
- @react-native-async-storage/async-storage

### UI
- @expo/vector-icons
- @rneui/themed

### Development
- TypeScript
- ESLint
- Prettier

## 🤝 Contributing

1. Follow the established code style
2. Write comprehensive tests
3. Update documentation
4. Submit pull requests for review

## 📄 License

This project is part of the Quantum Muscle application.
