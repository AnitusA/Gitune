# Common Issues & Solutions

## ❌ "Cannot find module 'babel-preset-expo'"

**Cause:** Metro bundler cached old Babel configuration

**Solution:**
```bash
# Windows (PowerShell)
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
npx expo start --clear

# macOS/Linux
pkill -9 node
npx expo start --clear
```

## ❌ Environment variables not loading (@env module)

**Cause:** `.env` file missing or not loaded

**Solution:**
1. Make sure `.env` exists in project root
2. Check that `babel.config.js` has the `react-native-dotenv` plugin
3. Restart with cache clear:
```bash
npx expo start --clear
```

## ❌ TypeScript errors for @env module

**Cause:** Missing type declarations

**Solution:** The `env.d.ts` file should already exist. If not, create it:
```typescript
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}
```

## ❌ Supabase auth errors or "Invalid JWT"

**Causes:**
- Wrong credentials in `.env`
- RLS (Row Level Security) not enabled
- Schema not run correctly

**Solutions:**
1. Double-check your `.env` file has correct Supabase URL and key
2. Re-run `supabase_schema.sql` in Supabase SQL Editor
3. Check Supabase Dashboard → Authentication → Users to see if signup worked

## ❌ "@expo/vector-icons" not found

**Cause:** Package missing (shouldn't happen with Expo)

**Solution:**
```bash
npx expo install @expo/vector-icons
```

## ❌ Metro bundler stuck at "Bundling..."

**Solutions:**
```bash
# Try 1: Clear cache
npx expo start --clear

# Try 2: Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules  # Windows
rm -rf node_modules                        # macOS/Linux
npm install
npx expo start --clear

# Try 3: Clear watchman (macOS/Linux)
watchman watch-del-all
```

## ❌ "Port 8081 already in use"

**Cause:** Another Metro process is running

**Solution:**
```bash
# Windows
Stop-Process -Name "node" -Force
npx expo start

# macOS/Linux
lsof -ti:8081 | xargs kill -9
npx expo start
```

## ❌ GitHub API "Bad credentials" or 401

**Causes:**
- Incorrect GitHub token
- Token doesn't have `repo` scope
- Token expired

**Solutions:**
1. Generate a new token: https://github.com/settings/tokens
2. Make sure to select **`repo`** scope
3. Update in Profile page in the app

## ❌ Tasks/Videos not showing after creating

**Cause:** Not refetching after mutation

**Solution:** This should auto-refresh. If not, pull to refresh on the screen.

## ❌ Login screen not appearing

**Cause:** User session cached from previous run

**Solution:**
1. Clear app data (if on device)
2. Or sign out from Profile page

## ❌ "Cannot read property 'id' of null"

**Cause:** Component trying to access user before auth loads

**Solution:** Already handled with loading states. If you still see this, make sure you're using `useAuth()` hook correctly.

---

## 🔄 Nuclear Option (Full Reset)

If nothing works, try this complete reset:

```bash
# Kill all node processes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue  # Windows
# pkill -9 node                                                   # macOS/Linux

# Delete all caches and dependencies
Remove-Item -Recurse -Force node_modules, .expo  # Windows
# rm -rf node_modules .expo                        # macOS/Linux

# Reinstall everything
npm install

# Start fresh
npx expo start --clear
```

---

## 📧 Still Having Issues?

1. Check the [Expo Documentation](https://docs.expo.dev/)
2. Check [Supabase Documentation](https://supabase.com/docs)
3. Search for the error message on [Stack Overflow](https://stackoverflow.com/)

---

## 💡 Pro Tips

- **Always use `--clear` flag** when troubleshooting bundler issues
- **Check `.env` file first** for any auth/API issues
- **Restart Expo Go app** on your phone if changes aren't reflecting
- **Use the web version** (`w` in Expo CLI) for faster debugging
