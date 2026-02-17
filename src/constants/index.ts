import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const COLORS = {
    BACKGROUND: "#0F172A", // Dark Slate
    CARD_BG: "#1E293B",   // Slate 800
    PRIMARY: "#3B82F6",   // Blue 500
    SECONDARY: "#10B981", // Emerald 500 (Duolingo)
    ACCENT: "#F59E0B",    // Amber 500 (Fire/Streak)
    TEXT_PRIMARY: "#F8FAFC",
    TEXT_SECONDARY: "#94A3B8",
    ERROR: "#EF4444",
    SUCCESS: "#22C55E",
    GITHUB_GREEN: "#2dba4e",
    CLICKUP_PURPLE: "#7b68ee",
};

export const ENV = {
    SUPABASE_URL: SUPABASE_URL || '',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || '',
};

export const CONSTANTS = {
    GITHUB_REPO_OWNER: "your-username", // For auto-commit (now user-specific from DB)
    GITHUB_REPO_NAME: "daily-habit-repo", // For auto-commit
    GITHUB_FILE_PATH: "streak.txt",
    AUTO_COMMIT_TIME: {
        HOUR: 23,
        MINUTE: 50,
    },
};
