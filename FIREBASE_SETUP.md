# Firebase Setup Guide for SignalX

This guide will help you set up Firebase authentication for the SignalX application.

## Prerequisites

- A Google account
- Node.js and pnpm installed
- The SignalX project cloned and dependencies installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project" or select an existing one
3. Enter a project name (e.g., "SignalX")
4. Follow the setup wizard to complete project creation

## Step 2: Enable Authentication

1. In the Firebase Console, go to **Authentication**
2. Click on the **Sign-in method** tab
3. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click Save

## Step 3: Get Your Firebase Configuration

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Click on your web app (or create one if you haven't)
3. Copy your Firebase configuration
4. You should see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "yourproject.firebaseapp.com",
  projectId: "yourproject",
  storageBucket: "yourproject.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
}
```

## Step 4: Add Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourproject
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...
   ```

## Step 5: Test Authentication

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/auth/register`

3. Create a test account with an email and password

4. You should be redirected to the dashboard

5. Check the Firebase Console under **Authentication** → **Users** to see your new user

## Using Demo Account

For testing purposes, you can use the demo credentials shown on the login page:
- Email: demo@signalx.com
- Password: Demo123456!

To create this account:
1. Go to `http://localhost:3000/auth/register`
2. Use the credentials above to create the account
3. Once created, you can log in with these credentials

## Features Implemented

### Authentication Pages
- **Login Page** (`/auth/login`) - Sign in with email and password
- **Register Page** (`/auth/register`) - Create new account with password validation
- Protected routes that redirect to login if not authenticated

### User Features
- Email/password authentication
- Password validation (minimum 8 characters, uppercase, numbers)
- Password confirmation
- Real-time password strength indicator
- Logout functionality
- User profile modal with user info

### Protected Routes
The following routes are protected and require authentication:
- `/dashboard`
- `/insights`
- `/settings`

Unauthenticated users will be redirected to `/auth/login`

## Troubleshooting

### "Firebase configuration is not available"
- Check that your `.env.local` file exists and has the correct values
- All environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Restart your dev server after adding environment variables

### "Email already in use"
- The email is already registered in Firebase
- Try registering with a different email address
- You can check and delete test users in the Firebase Console

### "Invalid password"
- Password must be at least 8 characters long
- Password must contain an uppercase letter
- Password must contain a number

### CORS or Firebase errors
- Make sure your Firebase project is set up correctly
- Check that the API key is valid
- Verify that Authentication is enabled in Firebase Console

## Next Steps

1. Customize the authentication pages to match your branding
2. Add social authentication (Google, GitHub, etc.)
3. Add password reset functionality
4. Add user profile management
5. Add email verification
6. Set up Firestore database for user data persistence

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
