import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { customSignIn, customSignUp } from '../api/customAuth';

// Custom user interface for our auth system
interface CustomUser {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: CustomUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: any }>;
    register: (email: string, password: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => ({ error: null }),
    register: async () => ({ error: null }),
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

const USER_STORAGE_KEY = '@dream_app_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<CustomUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user session
        checkStoredUser();
    }, []);

    const checkStoredUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading stored user:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await customSignIn(email, password);
        if (data && !error) {
            // Store user in state and AsyncStorage
            const userData: CustomUser = {
                id: data.id,
                email: data.email,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
            setUser(userData);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
        return { error };
    };

    const register = async (email: string, password: string) => {
        const { data, error } = await customSignUp(email, password);
        if (data && !error) {
            // Store user in state and AsyncStorage
            const userData: CustomUser = {
                id: data.id,
                email: data.email,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
            setUser(userData);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
        return { error };
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
