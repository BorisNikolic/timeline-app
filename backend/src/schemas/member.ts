import { z } from 'zod';

// Member role enum
const memberRoleSchema = z.enum(['Admin', 'Editor', 'Viewer']);

/**
 * Invite member request body schema
 */
export const inviteMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  role: memberRoleSchema.default('Viewer'),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/**
 * Update member role request body schema
 */
export const updateMemberRoleSchema = z.object({
  role: memberRoleSchema,
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

/**
 * Member user ID param validation
 */
export const memberUserIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type MemberUserIdParam = z.infer<typeof memberUserIdParamSchema>;

/**
 * Combined timeline and user ID params
 */
export const timelineMemberParamsSchema = z.object({
  timelineId: z.string().uuid('Invalid timeline ID format'),
  userId: z.string().uuid('Invalid user ID format'),
});

export type TimelineMemberParams = z.infer<typeof timelineMemberParamsSchema>;
