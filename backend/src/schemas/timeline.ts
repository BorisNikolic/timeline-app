import { z } from 'zod';
import { TIMELINE_COLORS } from '../types/timeline';

// Timeline theme color validation
const timelineColorSchema = z.enum(TIMELINE_COLORS);

// Timeline status enum
const timelineStatusSchema = z.enum(['Planning', 'Active', 'Completed', 'Archived']);

// Date validation (YYYY-MM-DD format)
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/**
 * Create timeline request body schema
 */
export const createTimelineSchema = z.object({
  name: z
    .string()
    .min(1, 'Timeline name is required')
    .max(255, 'Timeline name must be 255 characters or less')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .nullable(),
  startDate: dateSchema,
  endDate: dateSchema,
  themeColor: timelineColorSchema.optional().default('blue'),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be on or after start date', path: ['endDate'] }
);

export type CreateTimelineInput = z.infer<typeof createTimelineSchema>;

/**
 * Update timeline request body schema
 */
export const updateTimelineSchema = z.object({
  name: z
    .string()
    .min(1, 'Timeline name is required')
    .max(255, 'Timeline name must be 255 characters or less')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .nullable(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  themeColor: timelineColorSchema.optional(),
  status: timelineStatusSchema.optional(),
  // For optimistic locking
  expectedUpdatedAt: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  { message: 'End date must be on or after start date', path: ['endDate'] }
);

export type UpdateTimelineInput = z.infer<typeof updateTimelineSchema>;

/**
 * Copy timeline request body schema
 */
export const copyTimelineSchema = z.object({
  name: z
    .string()
    .min(1, 'Timeline name is required')
    .max(255, 'Timeline name must be 255 characters or less')
    .trim(),
  startDate: dateSchema,
  endDate: dateSchema,
  includeCategories: z.boolean().optional().default(true),
  includeEvents: z.boolean().optional().default(true),
  includeAssignments: z.boolean().optional().default(false),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be on or after start date', path: ['endDate'] }
);

export type CopyTimelineInput = z.infer<typeof copyTimelineSchema>;

/**
 * Set template request body schema
 */
export const setTemplateSchema = z.object({
  isTemplate: z.boolean(),
});

export type SetTemplateInput = z.infer<typeof setTemplateSchema>;

/**
 * Timeline ID param validation
 */
export const timelineIdParamSchema = z.object({
  timelineId: z.string().uuid('Invalid timeline ID format'),
});

export type TimelineIdParam = z.infer<typeof timelineIdParamSchema>;

/**
 * Timeline list query params
 */
export const timelineListQuerySchema = z.object({
  status: timelineStatusSchema.optional(),
  includeArchived: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
});

export type TimelineListQuery = z.infer<typeof timelineListQuerySchema>;
