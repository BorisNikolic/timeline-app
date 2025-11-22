import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import {
  requireTimelineRole,
  requireAdmin,
} from '../middleware/timelineAuth';
import { validate, validateParams } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import MemberService, { LastAdminError } from '../services/MemberService';
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  timelineMemberParamsSchema,
} from '../schemas/member';
import { timelineIdParamSchema } from '../schemas/timeline';

const router = Router({ mergeParams: true });

/**
 * GET /api/timelines/:timelineId/members
 * List all members of a timeline
 */
router.get(
  '/',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'),
  asyncHandler(async (req: Request, res: Response) => {
    const members = await MemberService.getMembers(req.params.timelineId);
    res.json(members);
  })
);

/**
 * POST /api/timelines/:timelineId/members
 * Invite a new member to the timeline (Admin only)
 */
router.post(
  '/',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireAdmin,
  validate(inviteMemberSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const member = await MemberService.inviteMember(
        req.params.timelineId,
        req.user!.userId,
        req.body
      );
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already a member')) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * PUT /api/timelines/:timelineId/members/:userId
 * Update a member's role (Admin only)
 */
router.put(
  '/:userId',
  authenticate,
  validateParams(timelineMemberParamsSchema),
  requireAdmin,
  validate(updateMemberRoleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const member = await MemberService.updateRole(
        req.params.timelineId,
        req.params.userId,
        req.body
      );
      res.json(member);
    } catch (error) {
      if (error instanceof LastAdminError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof Error && error.message === 'Member not found') {
        return res.status(404).json({ error: 'Member not found' });
      }
      throw error;
    }
  })
);

/**
 * DELETE /api/timelines/:timelineId/members/:userId
 * Remove a member from the timeline (Admin only)
 */
router.delete(
  '/:userId',
  authenticate,
  validateParams(timelineMemberParamsSchema),
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const deleted = await MemberService.removeMember(
        req.params.timelineId,
        req.params.userId
      );

      if (!deleted) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof LastAdminError) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * POST /api/timelines/:timelineId/leave
 * Current user leaves the timeline
 */
router.post(
  '/leave',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireTimelineRole('Viewer'),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await MemberService.leaveTimeline(
        req.user!.userId,
        req.params.timelineId
      );
      res.status(204).send();
    } catch (error) {
      if (error instanceof LastAdminError) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  })
);

export default router;
