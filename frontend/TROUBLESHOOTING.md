# Frontend Empty Screen - Troubleshooting

## Quick Fixes

### 1. Check if Clerk Key is Set

Create `frontend/.env` file with:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

**If key is missing**, you'll see a helpful message on screen.

### 2. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for errors
- **Network tab**: Check if files are loading

### 3. Common Issues

**Issue: Blank white screen**
- Check browser console for errors
- Verify `npm install` completed successfully
- Check if Vite dev server is running

**Issue: "Clerk Configuration Required" message**
- Add `VITE_CLERK_PUBLISHABLE_KEY` to `frontend/.env`
- Restart dev server after adding

**Issue: Routing not working**
- Make sure you're accessing `http://localhost:5173/`
- Check if React Router is working

### 4. Verify Setup

```bash
cd frontend
npm install
npm run dev
```

Should see:
```
VITE v4.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 5. Test Without Clerk (Temporary)

If you want to test without Clerk first, you can temporarily modify `App.tsx` to skip Clerk check, but you'll need Clerk for full functionality.

## What Should You See?

1. **Without Clerk Key**: Configuration message
2. **With Clerk Key**: Home page with hero section, features, and CTA
3. **After Sign In**: Redirect to dashboard

## Still Not Working?

1. Clear browser cache
2. Try incognito/private window
3. Check terminal for build errors
4. Verify all dependencies installed: `npm list`
