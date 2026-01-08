import { z } from 'zod';

// Member role enum
const memberRoleSchema = z.enum(['Admin', 'Editor', 'Viewer']);

/**
 * Create invitation request body schema
 */
export const createInvitationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .transform(email => email.toLowerCase()),
  role: memberRoleSchema.default('Viewer'),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

/**
 * Accept invitation for new user (registration)
 */
export const acceptNewUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
});

export type AcceptNewUserInput = z.infer<typeof acceptNewUserSchema>;

/**
 * Token parameter validation
 */
export const tokenParamSchema = z.object({
  token: z.string()
    .min(40, 'Invalid token format')
    .max(100, 'Invalid token format'),
});

export type TokenParam = z.infer<typeof tokenParamSchema>;

/**
 * Invitation ID parameter validation
 */
export const invitationIdParamSchema = z.object({
  invitationId: z.string().uuid('Invalid invitation ID format'),
});

export type InvitationIdParam = z.infer<typeof invitationIdParamSchema>;

/**
 * Combined timeline and invitation ID params
 */
export const timelineInvitationParamsSchema = z.object({
  timelineId: z.string().uuid('Invalid timeline ID format'),
  invitationId: z.string().uuid('Invalid invitation ID format'),
});

export type TimelineInvitationParams = z.infer<typeof timelineInvitationParamsSchema>;
