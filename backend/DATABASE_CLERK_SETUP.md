# Database Changes for Clerk Integration

## Migration Required

Run this migration to add Clerk support:

```bash
cd backend
npm run migrate
```

This will add a `clerk_user_id` column to the `users` table.

## What Changed

### Database Schema
- Added `clerk_user_id` column to `users` table
- This column links Clerk users to your database users
- Allows both Clerk and traditional JWT authentication

### Backend Changes
1. **Migration**: `008_add_clerk_user_id.js` - Adds the new column
2. **Auth Middleware**: Updated to verify both Clerk and JWT tokens
3. **Auth Routes**: Added `/api/auth/sync` endpoint to sync Clerk users

## How It Works

1. User signs in with Clerk (frontend)
2. Frontend sends Clerk token to backend
3. Backend verifies token and extracts Clerk user ID
4. Backend finds or creates user in database with `clerk_user_id`
5. All subsequent requests use your database `user_id` for foreign keys

## Backend Environment Variables

Add to `backend/.env`:

```
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

Get this from your Clerk dashboard → API Keys → Secret Key

## Installation

```bash
cd backend
npm install
npm run migrate
```

## Testing

After migration:
1. Sign in with Clerk (frontend)
2. Backend automatically creates/updates user in database
3. All existing features work with Clerk users

## Backward Compatibility

- ✅ Traditional JWT auth still works
- ✅ Existing users continue to work
- ✅ New Clerk users are automatically synced
