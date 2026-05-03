# SignalX Deployment Guide

This deployment guide walks through production-ready deployment for SignalX, including environment setup, Firebase authentication, Supabase database configuration, local verification, and deployment to Vercel.

## 1. Overview

SignalX is a Next.js 16 application with:
- Firebase authentication for user sign-in
- Supabase PostgreSQL for event, insights, and alert storage
- Real-time subscriptions via Supabase Realtime
- AI insight generation via an external Grok service

Recommended deployment target: **Vercel**.

## 2. Prerequisites

- Node.js 18+ installed
- `pnpm` installed (or `npm` / `yarn`)
- Firebase project with Email/Password auth enabled
- Supabase project with database schema created
- Vercel account (or another hosted platform supporting Next.js)

## 3. Environment Variables

Copy `.env.example` to `.env.local` for local development and to your platform environment variables for production.

Required variables:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GROK_API_KEY=

NEXT_PUBLIC_APP_ENV=development
```

### Notes
- `FIREBASE_PRIVATE_KEY` must preserve newlines. In most systems, wrap it in quotes and use `\n` placeholders.
- `NEXT_PUBLIC_` variables are accessible in the browser. Keep the service role key secret and never expose it on the client.

## 4. Firebase Setup

1. Open the Firebase Console and create a new project.
2. Enable **Authentication > Sign-in method > Email/Password**.
3. Create a service account for backend verification:
   - Go to **Project Settings > Service accounts**
   - Create a new private key
   - Copy `project_id`, `client_email`, and `private_key`
4. Add these values to `.env.local`:

```dotenv
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 5. Supabase Setup

1. Create a Supabase project.
2. Create the database tables used by SignalX:
   - `users`
   - `events`
   - `insights`
   - `alerts`
3. Use the Supabase SQL editor or migration system to create the correct schema.
4. Copy the Supabase URL and anon/public key to `.env.local`.
5. Copy the Supabase service role key to `.env.local` for server-side operations.

## 6. Local Verification

Install dependencies:

```bash
pnpm install
```

Run the app locally:

```bash
pnpm dev
```

Open `http://localhost:3000` and verify:
- Authentication pages load
- Dashboard loads after login
- Realtime feed and alerts work
- API routes return data with authentication

## 7. Build for Production

Run the production build locally to verify:

```bash
pnpm build
```

If the build succeeds, the app is ready to deploy.

## 8. Deploy to Vercel

### Using the Vercel CLI

```bash
pnpm install -g vercel
vercel login
vercel --prod
```

During deploy, set environment variables in the Vercel dashboard or using the CLI.

### Recommended Vercel Environment Variables

Set the same variables from `.env.example` in Vercel's environment settings.

Use these environments:
- `Production` for your live app
- `Preview` for branch deployments
- `Development` for local or staging tests

### Build Command

Use the default command:

```bash
pnpm build
```

### Output Directory

Vercel automatically detects Next.js and uses the correct settings.

## 9. Post-Deployment Checklist

- Confirm the deployed app loads successfully
- Register a new user and sign in
- Confirm protected routes redirect correctly
- Verify alerts, feed, and insights render
- Validate that API routes return correct JSON

## 10. Production Hardening

### Secure Environment Variables
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `FIREBASE_PRIVATE_KEY` server-only
- Do not commit `.env.local` or secrets to Git

### Performance
- Use Next.js static optimization where appropriate
- Cache Supabase queries server-side if needed
- Monitor build size and dependencies

### Logging and Monitoring
- Add logging for API route failures
- Monitor Supabase database performance
- Monitor Firebase auth usage and quota

## 11. Optional Deployment Targets

### Vercel
- Best supported for Next.js
- Automatic serverless and edge deployment

### Netlify / Render / Fly.io
- Also supported if you configure Next.js build and environment variables
- Ensure server-side API routes and Supabase service role access are protected

## 12. Troubleshooting

### Build fails due to missing env vars
- Check `.env.local` or platform settings
- Ensure all required variables are present

### Authentication errors
- Confirm Firebase auth is enabled
- Verify `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`

### Supabase connection errors
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Confirm database tables exist and permissions are set

---

For deployment-specific customizations, update this guide with any cloud provider settings, staging workflows, or team release procedures.
