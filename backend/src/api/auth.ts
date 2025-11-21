import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import { checkEmailWhitelist } from '../middleware/emailWhitelist';
import UserService from '../services/UserService';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/register
 * Register a new user
 * Requires email to be in ALLOWED_EMAILS whitelist (if configured)
 */
router.post(
  '/register',
  validate(registerSchema),
  checkEmailWhitelist, // Check if email is allowed before registration
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const authResponse = await UserService.register(req.body);
      res.status(201).json(authResponse);
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email already exists') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const authResponse = await UserService.login(req.body);
      res.json(authResponse);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        return res.status(401).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getUserById(req.user!.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  })
);

export default router;
