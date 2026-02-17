import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10; // Higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Stored hashed password
 * @returns True if password matches
 */
export const verifyPassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
};

// Example usage:
//
// SIGN UP:
// const password = 'MySecurePassword123';
// const hashed = await hashPassword(password);
// // Store 'hashed' in database
//
// SIGN IN:
// const inputPassword = 'MySecurePassword123';
// const storedHash = '$2a$10$N9qo8uLOickgx2ZMRZo...'; // from DB
// const isValid = await verifyPassword(inputPassword, storedHash);
// if (isValid) { /* allow login */ }
