/**
 * Validates an email address format
 * @param email Email to validate
 * @returns Boolean indicating if the email format is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 * 
 * @param password Password to validate
 * @returns Boolean indicating if the password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  // Check minimum length
  if (password.length < 8) return false;
  // Check maximum length (security/usability cap)
  if (password.length > 63) return false;
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Check for number
  if (!/[0-9]/.test(password)) return false;
  
  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
};

/**
 * Validates username length constraints
 * Requirements:
 * - Between 6 and 16 characters (inclusive)
 * 
 * @param username Username to validate
 * @returns Boolean indicating if username meets length requirements
 */
export const validateUsernameLength = (username: string): boolean => {
  return typeof username === 'string' && username.length >= 6 && username.length <= 16;
};
