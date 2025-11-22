import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import UserService from '../services/UserService';

const router = Router();

/**
 * Search query schema
 */
const userSearchQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  excludeTimelineId: z.string().uuid('Invalid timeline ID format').optional(),
});

/**
 * GET /api/users/search
 * Search users for invite autocomplete
 */
router.get(
  '/search',
  authenticate,
  validateQuery(userSearchQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { q, excludeTimelineId } = req.query;
    const users = await UserService.search(
      q as string,
      excludeTimelineId as string | undefined
    );
    res.json(users);
  })
);

export default router;
