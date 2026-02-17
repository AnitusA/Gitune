

export const checkDuolingoStreak = async (username: string) => {
    if (!username) return { streak: 0, error: "Username not provided" };

    try {
        const response = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error("Duolingo API error");

        const data = await response.json();
        if (data.users && data.users.length > 0) {
            return {
                streak: data.users[0].streak,
                dailyGoal: data.users[0].daily_goal,
                siteStreak: data.users[0].site_streak
            };
        }
        return { streak: 0 };
    } catch (error) {
        console.error("Duolingo Fetch Error:", error);
        return { streak: 0, error };
    }
};
