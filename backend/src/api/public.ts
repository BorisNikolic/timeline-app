/**
 * Public API routes - READ-ONLY endpoints for mobile app
 *
 * SECURITY: These endpoints are intentionally unauthenticated for public access.
 * - Only GET methods allowed (no POST, PUT, DELETE, PATCH)
 * - Only returns non-sensitive data (no user IDs, passwords, emails)
 * - Only returns Active or Completed timelines (not Planning or Archived)
 * - All queries use parameterized inputs via existing services
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateParams, validateQuery } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import { query } from '../db/connection';

const router = Router();

// Validation schemas
const timelineIdParamSchema = z.object({
  timelineId: z.string().uuid(),
});

const eventsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * Public timeline data - excludes sensitive fields like ownerId
 */
interface PublicTimeline {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  themeColor: string;
  status: string;
}

/**
 * Public event data - excludes sensitive fields like createdBy
 */
interface PublicEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  endTime: string | null;
  description: string | null;
  categoryId: string;
  assignedPerson: string | null;
  status: string;
  priority: string;
}

/**
 * Public category data - excludes sensitive fields like createdBy
 */
interface PublicCategory {
  id: string;
  name: string;
  color: string;
}

/**
 * GET /api/public/timelines
 * List all publicly accessible timelines (Active or Completed only)
 */
router.get(
  '/timelines',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await query(
      `SELECT
         id, name, description,
         startDate, endDate,
         themeColor, status
       FROM timelines
       WHERE status IN ('Active', 'Completed')
       ORDER BY startDate DESC`
    );

    const timelines: PublicTimeline[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      startDate: row.startdate instanceof Date
        ? row.startdate.toISOString().split('T')[0]
        : row.startdate,
      endDate: row.enddate instanceof Date
        ? row.enddate.toISOString().split('T')[0]
        : row.enddate,
      themeColor: row.themecolor,
      status: row.status,
    }));

    res.json(timelines);
  })
);

/**
 * GET /api/public/timelines/:timelineId
 * Get a single timeline by ID (must be Active or Completed)
 */
router.get(
  '/timelines/:timelineId',
  validateParams(timelineIdParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT
         id, name, description,
         startDate, endDate,
         themeColor, status
       FROM timelines
       WHERE id = $1 AND status IN ('Active', 'Completed')`,
      [req.params.timelineId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    const row = result.rows[0];
    const timeline: PublicTimeline = {
      id: row.id,
      name: row.name,
      description: row.description,
      startDate: row.startdate instanceof Date
        ? row.startdate.toISOString().split('T')[0]
        : row.startdate,
      endDate: row.enddate instanceof Date
        ? row.enddate.toISOString().split('T')[0]
        : row.enddate,
      themeColor: row.themecolor,
      status: row.status,
    };

    res.json(timeline);
  })
);

/**
 * GET /api/public/timelines/:timelineId/events
 * Get all events for a public timeline
 */
router.get(
  '/timelines/:timelineId/events',
  validateParams(timelineIdParamSchema),
  validateQuery(eventsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    // First verify timeline is public (Active or Completed)
    const timelineCheck = await query(
      `SELECT id FROM timelines WHERE id = $1 AND status IN ('Active', 'Completed')`,
      [req.params.timelineId]
    );

    if (timelineCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    // Build query with optional date filters
    let sql = `
      SELECT
        id, title, date, time, endTime,
        description, categoryId, assignedPerson,
        status, priority
      FROM events
      WHERE timelineId = $1
    `;
    const params: any[] = [req.params.timelineId];
    let paramCount = 2;

    if (startDate) {
      sql += ` AND date >= $${paramCount++}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND date <= $${paramCount++}`;
      params.push(endDate);
    }

    sql += ' ORDER BY date ASC, time ASC';

    const result = await query(sql, params);

    const events: PublicEvent[] = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      date: row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : row.date,
      time: row.time,
      endTime: row.endtime,
      description: row.description,
      categoryId: row.categoryid,
      assignedPerson: row.assignedperson,
      status: row.status,
      priority: row.priority,
    }));

    res.json(events);
  })
);

/**
 * GET /api/public/timelines/:timelineId/categories
 * Get all categories (stages) for a public timeline
 */
router.get(
  '/timelines/:timelineId/categories',
  validateParams(timelineIdParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    // First verify timeline is public (Active or Completed)
    const timelineCheck = await query(
      `SELECT id FROM timelines WHERE id = $1 AND status IN ('Active', 'Completed')`,
      [req.params.timelineId]
    );

    if (timelineCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    const result = await query(
      `SELECT id, name, color
       FROM categories
       WHERE timelineId = $1
       ORDER BY name ASC`,
      [req.params.timelineId]
    );

    const categories: PublicCategory[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
    }));

    res.json(categories);
  })
);

export default router;
