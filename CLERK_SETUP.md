# Clerk Authentication Setup

## Getting Your Clerk API Key

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Create a new application
3. Copy your **Publishable Key** from the dashboard
4. Add it to your `frontend/.env` file:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

## Backend Integration

Your backend needs to verify Clerk tokens. Update your backend to accept Clerk JWT tokens:

1. Install Clerk backend SDK:
```bash
cd backend
npm install @clerk/clerk-sdk-node
```

2. Update backend middleware to verify Clerk tokens (optional - you can keep your current JWT system and sync Clerk users to your DB)

## Background Image

Place your background image in:
- `frontend/public/background.jpg` (or `.png`)

The home page will automatically use it. Supported formats: JPG, PNG, WebP

## After Setup

1. Install Clerk package:
```bash
cd frontend
npm install
```

2. Restart frontend:
```bash
npm run dev
```

3. Visit http://localhost:5173 - you'll see the home page first!

## Features

- ✅ Home page with website information
- ✅ Clerk authentication (sign-in/sign-up)
- ✅ Background image support
- ✅ Protected routes using Clerk
- ✅ Seamless integration with existing backend
