
import { Buffer } from 'buffer';
import { CONSTANTS } from '../constants';

const GITHUB_API_BASE = 'https://api.github.com';

export const getGitHubStreak = async (username: string, token: string) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Fetch user events for today
        const response = await fetch(`${GITHUB_API_BASE}/users/${username}/events?per_page=1`, {
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            console.error('GitHub fetch failed:', response.status);
            return { committedToday: false, streak: 0 };
        }

        const events = await response.json();
        if (events.length > 0) {
            const latestEvent = events[0];
            const eventDate = latestEvent.created_at.split('T')[0];
            return {
                committedToday: eventDate === today,
                lastCommit: eventDate
            };
        }
        return { committedToday: false };
    } catch (error) {
        console.error('Error fetching GitHub streak:', error);
        return { committedToday: false, error };
    }
};

export const commitToRepo = async (token: string, message: string = "Keeping the streak alive 🔥") => {
    try {
        // 1. First, get the authenticated user's username
        const userResponse = await fetch(`${GITHUB_API_BASE}/user`, {
            headers: { Authorization: `token ${token}` }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid GitHub token. Please check your token in Profile settings.');
        }

        const userData = await userResponse.json();
        const username = userData.login;

        // 2. Use a simple repository name for auto-commits
        const REPO_NAME = 'daily-commits';
        const FILE_PATH = 'streak.txt';
        const url = `${GITHUB_API_BASE}/repos/${username}/${REPO_NAME}/contents/${FILE_PATH}`;

        // 3. Check if repository exists, if not provide helpful error
        const repoCheckUrl = `${GITHUB_API_BASE}/repos/${username}/${REPO_NAME}`;
        const repoCheck = await fetch(repoCheckUrl, {
            headers: { Authorization: `token ${token}` }
        });

        if (!repoCheck.ok) {
            throw new Error(`Repository '${username}/${REPO_NAME}' not found.\n\nTo use auto-commit:\n1. Create a repository named '${REPO_NAME}' on GitHub\n2. Make it public or private (your choice)\n3. Try again!\n\nOr commit manually to any repository to maintain your streak.`);
        }

        // 4. Get the current file SHA (if it exists)
        const getFile = await fetch(url, {
            headers: { Authorization: `token ${token}` }
        });

        let sha = null;
        if (getFile.ok) {
            const fileData = await getFile.json();
            sha = fileData.sha;
        }

        // 5. Prepare content
        const content = `Streak updated at: ${new Date().toISOString()}\nCommit #${Date.now()}\n\nDaily commit to maintain GitHub contributions! 🔥`;
        const contentEncoded = Buffer.from(content).toString('base64');

        // 6. Update/Create file
        const body: any = {
            message,
            content: contentEncoded,
            branch: 'main'
        };
        if (sha) body.sha = sha;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409) {
                throw new Error('Commit conflict. Try again in a moment.');
            }
            throw new Error(`Commit failed: ${errorData.message || 'Unknown error'}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Auto-commit error:', error);
        throw error;
    }
};
