
import { API_KEYS } from '../constants';

const BASE_URL = 'https://api.clickup.com/api/v2';

export const getClickUpTasks = async () => {
    const token = API_KEYS.CLICKUP_API_TOKEN;
    if (!token || token.includes("your-")) return { tasks: [] };

    try {
        // 1. Get Authorized User (for permissions check/debug)
        const userRes = await fetch(`${BASE_URL}/user`, {
            headers: { Authorization: token }
        });

        // 2. Get Teams (Workspaces)
        const teamsRes = await fetch(`${BASE_URL}/team`, {
            headers: { Authorization: token }
        });
        const teamsCmd = await teamsRes.json();

        if (!teamsCmd.teams || teamsCmd.teams.length === 0) return { tasks: [] };

        const teamId = teamsCmd.teams[0].id; // Use first team

        // 3. Get Tasks directly for the team (simple approach: get all open tasks assigned to me)
        // Alternatively, use `team/{team_id}/task?include_closed=false&assignees[]={user_id}`
        // For simplicity, we assume generic fetch.

        const tasksRes = await fetch(`${BASE_URL}/team/${teamId}/task?page=0&include_closed=true&reverse=true`, {
            headers: { Authorization: token }
        });

        const tasksData = await tasksRes.json();
        return { tasks: tasksData.tasks || [] };

    } catch (error) {
        console.error("ClickUp API Error:", error);
        return { tasks: [], error };
    }
};

export const createTask = async (name: string, description: string = "") => {
    // Requires List ID. For simplicity, we assume we find the first list.
    // This is complex without knowing their specific setup.
    // We'll return a stub for now.
    console.warn("createTask not fully implemented without List ID context");
    return null;
};
