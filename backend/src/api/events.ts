import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import EventService from '../services/EventService';
import { EventStatus, EventPriority } from '../models/Event';

const router = Router();

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  description: z.string().max(10000).optional(),
  categoryId: z.string().uuid(),
  assignedPerson: z.string().max(255).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  description: z.string().max(10000).optional(),
  categoryId: z.string().uuid().optional(),
  assignedPerson: z.string().max(255).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
});

const getEventsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(['date', 'urgency', 'priority']).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
  categoryId: z.string().uuid().optional(),
  assignedPerson: z.string().optional(),
});

/**
 * POST /api/events
 * Create a new event
 */
router.post(
  '/',
  authenticate,
  validate(createEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const event = await EventService.createEvent(req.user!.userId, req.body);
    res.status(201).json(event);
  })
);

/**
 * GET /api/events
 * Get all events with optional filtering and sorting
 */
router.get(
  '/',
  authenticate,
  validateQuery(getEventsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, sortBy, status, priority, categoryId, assignedPerson } = req.query as {
      startDate?: string;
      endDate?: string;
      sortBy?: 'date' | 'urgency' | 'priority';
      status?: EventStatus;
      priority?: EventPriority;
      categoryId?: string;
      assignedPerson?: string;
    };
    const events = await EventService.getEvents(
      startDate,
      endDate,
      sortBy,
      status,
      priority,
      categoryId,
      assignedPerson
    );
    res.json(events);
  })
);

/**
 * GET /api/events/:id
 * Get event by ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const event = await EventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  })
);

/**
 * PUT /api/events/:id
 * Update an event
 */
router.put(
  '/:id',
  authenticate,
  validate(updateEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const event = await EventService.updateEvent(req.params.id, req.body);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  })
);

/**
 * PATCH /api/events/:id
 * Partially update an event (used for bulk status updates)
 */
router.patch(
  '/:id',
  authenticate,
  validate(updateEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const event = await EventService.updateEvent(req.params.id, req.body);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  })
);

/**
 * DELETE /api/events/:id
 * Delete an event
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = await EventService.deleteEvent(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(204).send();
  })
);

export default router;
