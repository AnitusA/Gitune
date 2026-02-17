# Dream Flow - Productivity & Streak Tracker

A comprehensive productivity app built with **React Native** (Expo), **Supabase**, and modern API integrations for tracking your daily habits, commits, and tasks.

---

## 🚀 Features

### 1. **User Authentication**
- Email/password authentication via Supabase Auth
- Secure token storage per user
- Profile management

### 2. **Dashboard & Streak Tracking**
- **Duolingo** learning streak (unofficial API)
- **GitHub** commit tracking
- **Auto-commit** feature to save your GitHub streak

### 3. **Custom Task Management**
- Create, edit, delete tasks
- Set priorities (low, medium, high, urgent)
- Mark as complete/incomplete
- All tasks stored in Supabase (per user)

### 4. **Analytics**
- Productivity graphs
- GitHub-style contribution heatmap
- Weekly task trends

### 5. **YouTube Learning Playlist**
- Save educational videos
- Embedded player
- Track watched status

### 6. **Smart Reminders**
- Daily notifications at 11:50 PM if you haven't committed
- Duolingo streak reminders

---

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account ([supabase.com](https://supabase.com))

### 1. Clone & Install

```bash
cd project-dream
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the `Project URL` and `anon/public` key

### 3. Set Up Supabase Database

Run the SQL schema in your Supabase SQL Editor (`supabase_schema.sql`):

```bash
# Open supabase_schema.sql and execute it in:
# Supabase Dashboard → SQL Editor → New Query
```

This will create:
- `users` table (auto-populated on signup)
- `user_settings` table (for API tokens)
- `tasks` table (custom task management)
- `saved_videos` table (YouTube playlist)
- Row-level security policies

### 4. Run the App

```bash
npx expo start
```

Then:
- Press **`a`** for Android emulator
- Press **`i`** for iOS simulator (macOS only)
- Scan QR code with **Expo Go** app on your phone

---

## 🔑 Required API Tokens (Managed in Profile Page)

Once logged in, navigate to the **Profile** tab and add:

| Token | Purpose | How to Get |
|-------|---------|------------|
| **GitHub Personal Access Token** | Commit streak tracking & auto-commit | [Create PAT](https://github.com/settings/tokens) with `repo` scope |
| **GitHub Username** | Your GitHub handle | Your account username |
| **Duolingo Username** | Learning streak tracking | Your Duolingo profile username |
| **YouTube API Key** (Optional) | Enhanced YouTube features | [Google Cloud Console](https://console.cloud.google.com/) → Enable YouTube Data API v3 |

### GitHub Personal Access Token Setup:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Dream Flow")
4. Select scope: **`repo`** (Full control of private repositories)
5. Click "Generate token"
6. Copy and paste into the Profile page

---

## 📱 App Structure

```
project-dream/
├── src/
│   ├── api/
│   │   ├── supabase.ts        # Supabase client & DB functions
│   │   ├── github.ts          # GitHub streak & commit logic
│   │   └── duolingo.ts        # Duolingo streak fetching
│   ├── components/
│   │   └── GradientContainer.tsx
│   ├── constants/
│   │   └── index.ts           # Colors & env config
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication provider
│   ├── navigation/
│   │   └── RootNavigator.tsx  # Tab navigation
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   ├── VideosScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── utils/
│       └── reminders.ts       # Push notifications
├── App.tsx
├── .env                       # Your secrets (DO NOT COMMIT)
├── .env.example              # Template
└── supabase_schema.sql       # Database schema

```

---

## 🛠️ Technologies Used

- **React Native** (Expo SDK 54)
- **Supabase** (Auth + PostgreSQL)
- **TypeScript**
- **React Navigation** (Bottom Tabs + Stack)
- **expo-notifications** (Smart reminders)
- **react-native-chart-kit** (Analytics graphs)
- **react-native-youtube-iframe** (Video player)
- **react-native-dotenv** (Environment variables)

---

## 🔒 Security Notes

- **Never commit `.env`** - It's already in `.gitignore`
- API tokens are stored **encrypted in Supabase** with Row-Level Security
- Only authenticated users can access their own data
- GitHub tokens should have **minimal scopes** (only `repo` for auto-commit)

---

## 🎯 Usage

1. **Sign up** with email/password
2. **Add your tokens** in the Profile page
3. **Dashboard** shows your streaks automatically
4. **Tasks** tab for managing your to-do list
5. **Analytics** for visualizing your productivity
6. **Learn** tab to save YouTube tutorials
7. **Auto-commit** button saves your GitHub streak with one tap

---

## 📝 License

MIT License - feel free to use this for your own productivity journey!

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 💡 Tips

- Use **Expo Go** for quick testing on your phone
- For production, build with `eas build` (Expo Application Services)
- Enable **2FA** on your GitHub account for better security
- The Duolingo API is unofficial and may change - use at your own risk

---

**Happy tracking! 🚀🔥**
