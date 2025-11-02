import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { validateEmail, validatePassword, validateUsernameLength } from '../utils/validation';

const authService = new AuthService();
const sessionService = new SessionService();

export class AuthController {
  
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: Register a new user account
   *     description: Creates a new user account in the Darknet Duel system
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *           example:
   *             email: "hacker@darknet.com"
   *             username: "CyberNinja"
   *             password: "securepassword123"
   *     responses:
   *       201:
   *         description: User successfully registered
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *             example:
   *               message: "User registered successfully"
   *               user:
   *                 id: "550e8400-e29b-41d4-a716-446655440000"
   *                 email: "hacker@darknet.com"
   *                 username: "CyberNinja"
   *                 isActive: true
   *                 gamesPlayed: 0
   *                 gamesWon: 0
   *                 gamesLost: 0
   *                 rating: 1200
   *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       400:
   *         description: Bad request - validation errors
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               message: "Email and username are required"
   *       409:
   *         description: Conflict - email or username already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               message: "Email or username already exists"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;
      
      // Validate input
      if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, username, and password are required' });
      }
      
      // Enforce email maximum length per spec
      if (typeof email !== 'string' || email.length > 254) {
        return res.status(400).json({ message: 'Email must be 254 characters or fewer' });
      }

      // Validate email format (includes length and ASCII checks)
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format. Email must be valid, 254 characters or fewer, and contain only ASCII characters' });
      }
      
      // Validate username length (includes ASCII check)
      if (!validateUsernameLength(username)) {
        return res.status(400).json({ message: 'Username must be between 6 and 16 characters and contain only ASCII characters' });
      }

      // Validate password strength and length
      if (!validatePassword(password)) {
        return res.status(400).json({ 
          message: 'Password must be 8-63 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
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
  
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: Login a user
   *     description: Authenticates a user and returns a JWT token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *           example:
   *             email: "hacker@darknet.com"
   *             password: "securepassword123"
   *     responses:
   *       200:
   *         description: User successfully logged in
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *             example:
   *               message: "Login successful"
   *               user:
   *                 id: "550e8400-e29b-41d4-a716-446655440000"
   *                 email: "hacker@darknet.com"
   *                 username: "CyberNinja"
   *                 isActive: true
   *                 gamesPlayed: 15
   *                 gamesWon: 9
   *                 gamesLost: 6
   *                 rating: 1350
   *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       400:
   *         description: Bad request - missing email or password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               message: "Email and password are required"
   *       401:
   *         description: Unauthorized - invalid credentials or disabled account
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               message: "Invalid credentials"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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
        // Log failed login attempt
        await authService.logFailedLogin(email.toLowerCase(), 'user not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if account is active
      if (!user.isActive) {
        // Log failed login attempt
        await authService.logFailedLogin(email.toLowerCase(), 'account inactive');
        return res.status(401).json({ 
          message: 'This account is inactive!',
          inactiveReason: user.inactiveReason || 'Account has been deactivated',
          isInactive: true
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Log failed login attempt
        await authService.logFailedLogin(email.toLowerCase(), 'invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      await authService.updateLastLogin(user.id);
      
      // Log the login
      await authService.logUserLogin(user.id, user.username);
      
      // Invalidate all existing sessions for this user before creating a new one
      await sessionService.invalidateAllUserSessions(user.id);
      
      // Create new session (token)
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || undefined;
      const userAgent = req.headers['user-agent'] || undefined;
      const expiresInMinutes = process.env.SESSION_EXPIRY_MINUTES 
        ? parseInt(process.env.SESSION_EXPIRY_MINUTES) 
        : 7 * 24 * 60; // Default: 7 days
      const token = await sessionService.createSession(
        user.id,
        ipAddress,
        userAgent,
        expiresInMinutes
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
  
  /**
   * @swagger
   * /api/auth/profile:
   *   get:
   *     tags: [Authentication]
   *     summary: Get current user profile
   *     description: Retrieves the authenticated user's profile information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *             example:
   *               user:
   *                 id: "550e8400-e29b-41d4-a716-446655440000"
   *                 email: "hacker@darknet.com"
   *                 username: "CyberNinja"
   *                 isActive: true
   *                 lastLogin: "2023-12-01T10:30:00Z"
   *                 gamesPlayed: 15
   *                 gamesWon: 9
   *                 gamesLost: 6
   *                 rating: 1350
   *                 createdAt: "2023-11-01T08:00:00Z"
   *                 updatedAt: "2023-12-01T10:30:00Z"
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               message: "Authentication required. No token provided."
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               message: "User not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Get current user profile
  async getProfile(req: Request, res: Response) {
    try {
      // @ts-ignore - user is set by auth middleware
      const userId = req.user.id;
      
      const user = await authService.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user without password and avatar (use dedicated avatar endpoint)
      const { password: _, avatar: __, avatarMimeType: ___, ...userWithoutSensitiveData } = user;
      
      return res.status(200).json({
        user: userWithoutSensitiveData
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ message: 'Server error getting profile' });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   get:
   *     tags: [Authentication]
   *     summary: Logout current user
   *     description: Invalidates the current user's session token
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully logged out
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Logged out successfully"
   *             example:
   *               message: "Logged out successfully"
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               message: "Authentication required"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Logout user (invalidate session)
  async logout(req: Request, res: Response) {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Extract token from header
      const token = authHeader.split(' ')[1];

      // Invalidate the session
      await sessionService.invalidateSession(token);

      return res.status(200).json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Server error during logout' });
    }
  }

}
