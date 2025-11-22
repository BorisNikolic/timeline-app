/**
 * Preferences API Routes
 * Feature: 001-multi-timeline-system (User Story 4)
 *
 * Endpoints:
 * - GET /api/preferences - Get current user preferences
 * - PUT /api/preferences - Update user preferences
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { preferencesService } from '../services/PreferencesService';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Update preferences validation schema
 */
const updatePreferencesSchema = z.object({
  lastTimelineId: z.string().uuid().nullable(),
});

/**
 * GET /api/preferences
 * Get current user's preferences
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const preferences = await preferencesService.get(userId);

    if (!preferences) {
      // Return default preferences if none exist
      return res.json({
        id: null,
        userId,
        lastTimelineId: null,
        updatedAt: null,
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * PUT /api/preferences
 * Update user preferences
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Validate request body
    const parseResult = updatePreferencesSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: parseResult.error.errors,
      });
    }

    const { lastTimelineId } = parseResult.data;

    const preferences = await preferencesService.update(userId, lastTimelineId);
    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update preferences';

    if (message.includes('no access') || message.includes('archived')) {
      return res.status(403).json({ error: message });
    }

    res.status(500).json({ error: message });
  }
});

export default router;
