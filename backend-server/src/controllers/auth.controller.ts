import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { validateEmail, validatePassword } from '../utils/validation';

const authService = new AuthService();

export class AuthController {
  
  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;
      
      // Validate input
      if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, username, and password are required' });
      }
      
      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      // Validate password strength
      if (!validatePassword(password)) {
        return res.status(400).json({ 
          message: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }
      
      // Check if user already exists
      const userExists = await authService.findByEmailOrUsername(email, username);
      if (userExists) {
        if (userExists.email === email.toLowerCase()) {
          return res.status(409).json({ message: 'Email already in use' });
        }
        return res.status(409).json({ message: 'Username already in use' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const user = await authService.createUser({
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(201).json({
        message: 'User created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  }
  
  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Find user
      const user = await authService.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is disabled' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      await authService.updateLastLogin(user.id);
      
      // Generate JWT token
      const secret: Secret = process.env.JWT_SECRET || 'fallback_secret';
      const expiryValue = process.env.JWT_EXPIRY || '7d';
      const options: SignOptions = { expiresIn: expiryValue as any };
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        secret,
        options
      );
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error during login' });
    }
  }
  
  // Get current user profile
  async getProfile(req: Request, res: Response) {
    try {
      // @ts-ignore - user is set by auth middleware
      const userId = req.user.id;
      
      const user = await authService.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ message: 'Server error getting profile' });
    }
  }
}
