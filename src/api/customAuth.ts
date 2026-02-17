/**
 * EXAMPLE: Custom Authentication with Manual Password Hashing
 * 
 * This is an ALTERNATIVE to Supabase Auth if you want to manage
 * authentication yourself. NOT RECOMMENDED unless you have specific needs.
 * 
 * Supabase Auth is more secure and battle-tested!
 */

import { supabase } from './supabase';
import { hashPassword, verifyPassword } from '../utils/passwordHash';

// Custom users table schema (you'd need to create this)
// CREATE TABLE custom_auth_users (
//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   email TEXT UNIQUE NOT NULL,
//   password_hash TEXT NOT NULL,  -- Store hashed password here
//   created_at TIMESTAMP DEFAULT NOW()
// );

/**
 * Sign up with manual password hashing
 */
export const customSignUp = async (email: string, password: string) => {
    try {
        // 1. Hash the password
        const hashedPassword = await hashPassword(password);

        // 2. Store in database
        const { data, error } = await supabase
            .from('custom_auth_users')  // Your custom table
            .insert([
                {
                    email,
                    password_hash: hashedPassword,  // ← Hashed password stored here
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Custom signup error:', error);
        return { data: null, error };
    }
};

/**
 * Sign in with manual password verification
 */
export const customSignIn = async (email: string, password: string) => {
    try {
        // 1. Get user from database
        const { data: user, error } = await supabase
            .from('custom_auth_users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return { data: null, error: new Error('Invalid credentials') };
        }

        // 2. Verify password against stored hash
        const isPasswordValid = await verifyPassword(password, user.password_hash);

        if (!isPasswordValid) {
            return { data: null, error: new Error('Invalid credentials') };
        }

        // 3. Return user data (you'd generate a JWT token here in production)
        return { data: user, error: null };
    } catch (error) {
        console.error('Custom signin error:', error);
        return { data: null, error };
    }
};

/**
 * Change password with manual hashing
 */
export const customChangePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
) => {
    try {
        // 1. Get current user
        const { data: user, error } = await supabase
            .from('custom_auth_users')
            .select('password_hash')
            .eq('id', userId)
            .single();

        if (error || !user) throw new Error('User not found');

        // 2. Verify old password
        const isOldPasswordValid = await verifyPassword(oldPassword, user.password_hash);
        if (!isOldPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // 3. Hash new password
        const newHashedPassword = await hashPassword(newPassword);

        // 4. Update in database
        const { error: updateError } = await supabase
            .from('custom_auth_users')
            .update({ password_hash: newHashedPassword })
            .eq('id', userId);

        if (updateError) throw updateError;

        return { error: null };
    } catch (error) {
        console.error('Password change error:', error);
        return { error };
    }
};
