import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import {
  requireTimelineRole,
  requireAdmin,
} from '../middleware/timelineAuth';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import TimelineService, { ConflictError } from '../services/TimelineService';
import EventService from '../services/EventService';
import CategoryService from '../services/CategoryService';
import {
  createTimelineSchema,
  updateTimelineSchema,
  copyTimelineSchema,
  setTemplateSchema,
  timelineIdParamSchema,
  timelineListQuerySchema,
} from '../schemas/timeline';
import { EventStatus, EventPriority, OutcomeTag } from '../models/Event';

const router = Router();

/**
 * GET /api/timelines
 * List all timelines accessible to the current user
 */
router.get(
  '/',
  authenticate,
  validateQuery(timelineListQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const timelines = await TimelineService.getAccessible(req.user!.userId);
    res.json(timelines);
  })
);

/**
 * POST /api/timelines
 * Create a new timeline
 */
router.post(
  '/',
  authenticate,
  validate(createTimelineSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const timeline = await TimelineService.create(req.user!.userId, req.body);
      res.status(201).json(timeline);
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * GET /api/timelines/:timelineId
 * Get a single timeline by ID
 */
router.get(
  '/:timelineId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const timeline = await TimelineService.getById(
      req.params.timelineId,
      req.user!.userId
    );

    if (!timeline) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    res.json(timeline);
  })
);

/**
 * PUT /api/timelines/:timelineId
 * Update a timeline (Admin only)
 */
router.put(
  '/:timelineId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireAdmin,
  validate(updateTimelineSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { expectedUpdatedAt, ...data } = req.body;
      const timeline = await TimelineService.update(
        req.params.timelineId,
        data,
        expectedUpdatedAt
      );
      res.json(timeline);
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json({
          error: error.message,
          code: 'CONFLICT',
        });
      }
      throw error;
    }
  })
);

/**
 * DELETE /api/timelines/:timelineId
 * Delete a timeline (Admin only)
 */
router.delete(
  '/:timelineId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = await TimelineService.delete(req.params.timelineId);

    if (!deleted) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    res.status(204).send();
  })
);

/**
 * POST /api/timelines/:timelineId/unarchive
 * Unarchive a timeline (Admin only)
 */
router.post(
  '/:timelineId/unarchive',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const timeline = await TimelineService.unarchive(req.params.timelineId);
      res.json(timeline);
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * POST /api/timelines/:timelineId/copy
 * Copy a timeline with date shifting (Viewer+ can copy, becomes Admin of new)
 */
router.post(
  '/:timelineId/copy',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'), // Anyone with access can copy
  validate(copyTimelineSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const timeline = await TimelineService.copy(
        req.params.timelineId,
        req.user!.userId,
        req.body
      );
      res.status(201).json(timeline);
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * POST /api/timelines/:timelineId/set-template
 * Set template status (Admin only)
 */
router.post(
  '/:timelineId/set-template',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireAdmin,
  validate(setTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const timeline = await TimelineService.setTemplate(
      req.params.timelineId,
      req.body.isTemplate
    );
    res.json(timeline);
  })
);

/**
 * GET /api/templates
 * List all templates (publicly visible)
 */
router.get(
  '/templates',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const templates = await TimelineService.getTemplates();
    res.json(templates);
  })
);

// ============================================================================
// Timeline-Scoped Event Routes (T102)
// ============================================================================

// Validation schemas for events
const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  description: z.string().max(10000).optional(),
  categoryId: z.string().uuid(),
  assignedPerson: z.string().max(255).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
  description: z.string().max(10000).optional(),
  categoryId: z.string().uuid().optional(),
  assignedPerson: z.string().max(255).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
  retroNotes: z.string().max(10000).optional().nullable(),
  outcomeTag: z.nativeEnum(OutcomeTag).optional().nullable(),
});

const getEventsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(['date', 'urgency', 'priority']).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
  categoryId: z.string().uuid().optional(),
  assignedPerson: z.string().optional(),
  outcomeTag: z.nativeEnum(OutcomeTag).optional(),
});

/**
 * GET /api/timelines/:timelineId/events
 * Get all events for a timeline
 */
router.get(
  '/:timelineId/events',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'),
  validateQuery(getEventsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, sortBy, status, priority, categoryId, assignedPerson, outcomeTag } = req.query as {
      startDate?: string;
      endDate?: string;
      sortBy?: 'date' | 'urgency' | 'priority';
      status?: EventStatus;
      priority?: EventPriority;
      categoryId?: string;
      assignedPerson?: string;
      outcomeTag?: OutcomeTag;
    };
    const events = await EventService.getByTimeline(req.params.timelineId, {
      startDate,
      endDate,
      sortBy,
      status,
      priority,
      categoryId,
      assignedPerson,
      outcomeTag,
    });
    res.json(events);
  })
);

/**
 * POST /api/timelines/:timelineId/events
 * Create an event in a timeline
 */
router.post(
  '/:timelineId/events',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Editor'),
  validate(createEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const event = await EventService.createEvent(
      req.user!.userId,
      req.body,
      req.params.timelineId
    );
    res.status(201).json(event);
  })
);

/**
 * PUT /api/timelines/:timelineId/events/:eventId
 * Update an event in a timeline
 */
router.put(
  '/:timelineId/events/:eventId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Editor'),
  validate(updateEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    // Get timeline status for retro field validation
    const timeline = await TimelineService.getById(req.params.timelineId, req.user!.userId);
    const event = await EventService.updateEvent(
      req.params.eventId,
      req.body,
      timeline?.status
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  })
);

/**
 * PATCH /api/timelines/:timelineId/events/:eventId
 * Partially update an event (e.g., status change)
 */
router.patch(
  '/:timelineId/events/:eventId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Editor'),
  validate(updateEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const timeline = await TimelineService.getById(req.params.timelineId, req.user!.userId);
    const event = await EventService.updateEvent(
      req.params.eventId,
      req.body,
      timeline?.status
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  })
);

/**
 * DELETE /api/timelines/:timelineId/events/:eventId
 * Delete an event from a timeline
 */
router.delete(
  '/:timelineId/events/:eventId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Editor'),
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = await EventService.deleteEvent(req.params.eventId);

    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(204).send();
  })
);

// ============================================================================
// Timeline-Scoped Category Routes (T103)
// ============================================================================

// Validation schemas for categories
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be in hex format (#RRGGBB)'),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be in hex format (#RRGGBB)').optional(),
});

/**
 * GET /api/timelines/:timelineId/categories
 * Get all categories for a timeline
 */
router.get(
  '/:timelineId/categories',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoryService.getByTimeline(req.params.timelineId);
    res.json(categories);
  })
);

/**
 * POST /api/timelines/:timelineId/categories
 * Create a category in a timeline
 */
router.post(
  '/:timelineId/categories',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Editor'),
  validate(createCategorySchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const category = await CategoryService.createCategory(
        req.user!.userId,
        req.body,
        req.params.timelineId
      );
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof Error && error.message === 'Category with this name already exists') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * PUT /api/timelines/:timelineId/categories/:categoryId
 * Update a category in a timeline
 */
router.put(
  '/:timelineId/categories/:categoryId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Editor'),
  validate(updateCategorySchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const category = await CategoryService.updateCategory(
        req.params.categoryId,
        req.body
      );

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      if (error instanceof Error && error.message === 'Category with this name already exists') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * DELETE /api/timelines/:timelineId/categories/:categoryId
 * Delete a category from a timeline
 */
router.delete(
  '/:timelineId/categories/:categoryId',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Editor'),
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = await CategoryService.deleteCategory(req.params.categoryId);

    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  })
);

// ============================================================================
// Timeline-Scoped Export Routes (T108)
// ============================================================================

// Import export utilities lazily to avoid circular dependencies
import { generateCSV } from '../utils/export/csv-generator';
import { generateExcel } from '../utils/export/excel-generator';

/**
 * GET /api/timelines/:timelineId/export/events-csv
 * Export timeline events to CSV
 */
router.get(
  '/:timelineId/export/events-csv',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const events = await EventService.getByTimeline(req.params.timelineId);
    const csv = generateCSV(events);

    // Get timeline name for filename
    const timeline = await TimelineService.getById(req.params.timelineId, req.user!.userId);
    const filename = timeline ? `${timeline.name.replace(/[^a-z0-9]/gi, '_')}_events.csv` : 'events.csv';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  })
);

/**
 * GET /api/timelines/:timelineId/export/events-excel
 * Export timeline events to Excel
 */
router.get(
  '/:timelineId/export/events-excel',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const events = await EventService.getByTimeline(req.params.timelineId);
    const buffer = await generateExcel(events);

    // Get timeline name for filename
    const timeline = await TimelineService.getById(req.params.timelineId, req.user!.userId);
    const filename = timeline ? `${timeline.name.replace(/[^a-z0-9]/gi, '_')}_events.xlsx` : 'events.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  })
);

export default router;
