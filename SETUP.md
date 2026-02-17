# Quick Setup Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get Supabase Credentials

1. Go to **[supabase.com](https://supabase.com)** and create a free account
2. Click **"New Project"**
3. Fill in:
   - Project name: `dream-flow`
   - Database password: (choose a strong password)
   - Region: (closest to you)
4. Wait for the project to be created (~2 minutes)

### Step 3: Create Database Tables

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `supabase_schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see: "Success. No rows returned"

### Step 4: Get Your API Keys

1. In Supabase, go to **Settings** → **API** (left sidebar at the bottom)
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5: Configure .env File

Open the `.env` file in the project root and paste your credentials:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```

### Step 6: Run the App

```bash
npx expo start --clear
```

Then:
- Press **`a`** to open on Android emulator
- Press **`i`** to open on iOS simulator (macOS only)
- Or use **Expo Go** app on your phone and scan the QR code

---

## 📱 First Time Use

1. **Sign Up**
   - Open the app
   - Enter your email and password
   - Tap "Sign Up"

2. **Add Your Tokens** (Profile Tab)
   - Tap the **Profile** tab (person icon)
   - Add your:
     - **GitHub Token**: [Get it here](https://github.com/settings/tokens) (needs `repo` scope)
     - **GitHub Username**: Your GitHub handle
     - **Duolingo Username**: Your Duolingo profile name
   - Tap **Save Settings**

3. **Done!**
   - Go back to **Dashboard**
   - Your streaks will now appear! 🔥

---

## 🔑 Getting GitHub Personal Access Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token (classic)"**
3. Name: `Dream Flow`
4. Expiration: Choose your preference (e.g., 90 days or No expiration)
5. Select scopes:
   - ✅ **`repo`** (Full control of private repositories)
6. Scroll down and click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)
8. Paste it into the Profile page in the app

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
npx expo start --clear
```

### Metro bundler cache issues
```bash
npx expo start --clear
# or
rm -rf node_modules
npm install
npx expo start --clear
```

### Environment variables not loading
```bash
# Make sure .env file exists in project root
# Restart expo with --clear flag
npx expo start --clear
```

### Database errors
- Make sure you ran the SQL schema in Supabase
- Check that your `.env` credentials are correct
- Verify RLS policies are enabled (the schema does this automatically)

---

## 📞 Need Help?

- Check the main `README.md` for detailed documentation
- Supabase issues? Check their [documentation](https://supabase.com/docs)
- GitHub API issues? Check [GitHub API docs](https://docs.github.com/en/rest)

---

**You're ready to track your productivity! 🚀**
