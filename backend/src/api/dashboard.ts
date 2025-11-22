import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import DashboardService from '../services/DashboardService';
import { TimelineStatus, MemberRole } from '../types/timeline';

const router = Router();

/**
 * Query schema for dashboard filters
 */
const dashboardQuerySchema = z.object({
  status: z.enum(['Planning', 'Active', 'Completed', 'Archived']).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  role: z.enum(['Admin', 'Editor', 'Viewer']).optional(),
  sortBy: z.enum(['startDate', 'name', 'updatedAt', 'completion']).optional().default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET /api/dashboard
 * Get dashboard data with all accessible timelines and stats
 */
router.get(
  '/',
  authenticate,
  validateQuery(dashboardQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as TimelineStatus | undefined,
      year: req.query.year ? parseInt(req.query.year as string, 10) : undefined,
      role: req.query.role as MemberRole | undefined,
      sortBy: (req.query.sortBy || 'startDate') as 'startDate' | 'name' | 'updatedAt' | 'completion',
      sortOrder: (req.query.sortOrder || 'desc') as 'asc' | 'desc',
    };

    const dashboard = await DashboardService.getDashboard(req.user!.userId, filters);
    res.json(dashboard);
  })
);

/**
 * GET /api/dashboard/stats
 * Get aggregate statistics across all accessible timelines
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await DashboardService.getStats(req.user!.userId);
    res.json(stats);
  })
);

/**
 * Query schema for archive filters (US9)
 */
const archiveQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  search: z.string().max(255).optional(),
});

/**
 * GET /api/archive
 * Get archived timelines with pagination (US9: Archive Management)
 */
router.get(
  '/archive',
  authenticate,
  validateQuery(archiveQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const options = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      year: req.query.year ? parseInt(req.query.year as string, 10) : undefined,
      search: req.query.search as string | undefined,
    };

    const archive = await DashboardService.getArchive(req.user!.userId, options);
    res.json(archive);
  })
);

export default router;
