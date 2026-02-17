import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../constants';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

// ===== AUTH =====
export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// ===== USER SETTINGS =====
export const getUserSettings = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
    return { data, error };
};

export const upsertUserSettings = async (userId: string, settings: {
    github_token?: string;
    github_username?: string;
    duolingo_username?: string;
    youtube_api_key?: string;
}) => {
    try {
        // Use PostgreSQL's native UPSERT with ON CONFLICT
        const { data, error } = await supabase
            .from('user_settings')
            .upsert({ 
                user_id: userId, 
                ...settings,
                updated_at: new Date().toISOString() 
            }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
            })
            .select()
            .single();

        return { data, error };

    } catch (error: any) {
        console.error('Error in upsertUserSettings:', error);
        
        // Fallback: Try traditional update approach
        try {
            console.log('Attempting fallback update approach...');
            
            const { data: updateData, error: updateError } = await supabase
                .from('user_settings')
                .update({ 
                    ...settings, 
                    updated_at: new Date().toISOString() 
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (updateData) {
                return { data: updateData, error: null };
            }

            // If update fails, try insert (user might not have a record yet)
            const { data: insertData, error: insertError } = await supabase
                .from('user_settings')
                .insert([{ 
                    user_id: userId, 
                    ...settings,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString() 
                }])
                .select()
                .single();

            return { data: insertData, error: insertError };

        } catch (fallbackError) {
            console.error('All upsert methods failed:', fallbackError);
            return { data: null, error: fallbackError };
        }
    }
};

// Utility function to clean up duplicate user_settings records
export const cleanupDuplicateUserSettings = async (userId: string) => {
    try {
        // Get all records for this user
        const { data: allRecords } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (allRecords && allRecords.length > 1) {
            // Keep the most recent record, delete the rest
            const recordsToDelete = allRecords.slice(1);
            
            for (const record of recordsToDelete) {
                await supabase
                    .from('user_settings')
                    .delete()
                    .eq('id', record.id);
            }
            
            console.log(`Cleaned up ${recordsToDelete.length} duplicate user_settings records`);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
        return { success: false, error };
    }
};

// ===== TASKS =====
export const getTasks = async (userId: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data, error };
};

export const createTask = async (userId: string, task: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
}) => {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{ user_id: userId, ...task }])
        .select()
        .single();
    return { data, error };
};

export const updateTask = async (taskId: string, updates: any) => {
    const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single();
    return { data, error };
};

export const deleteTask = async (taskId: string) => {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
    return { error };
};

// ===== YOUTUBE VIDEOS =====
export const getSavedVideos = async (userId: string) => {
    const { data, error } = await supabase
        .from('saved_videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data, error };
};

export const saveYouTubeVideo = async (userId: string, video: { video_id: string; title: string }) => {
    const { data, error } = await supabase
        .from('saved_videos')
        .insert([{ user_id: userId, ...video }])
        .select()
        .single();
    return { data, error };
};

export const deleteVideo = async (videoId: string) => {
    const { error } = await supabase
        .from('saved_videos')
        .delete()
        .eq('id', videoId);
    return { error };
};
