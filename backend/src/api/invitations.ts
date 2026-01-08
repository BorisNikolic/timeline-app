import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/timelineAuth';
import { validate, validateParams } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import InvitationService from '../services/InvitationService';
import { InvitationError } from '../types/invitation';
import {
  createInvitationSchema,
  acceptNewUserSchema,
  tokenParamSchema,
  timelineInvitationParamsSchema,
} from '../schemas/invitation';
import { timelineIdParamSchema } from '../schemas/timeline';

// Router for timeline-scoped invitation endpoints (/api/timelines/:timelineId/invitations)
export const timelineInvitationsRouter = Router({ mergeParams: true });

// Router for public invitation endpoints (/api/invitations)
export const publicInvitationsRouter = Router();

/**
 * GET /api/timelines/:timelineId/invitations
 * List pending invitations for a timeline (Admin only)
 */
timelineInvitationsRouter.get(
  '/',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const invitations = await InvitationService.listPending(req.params.timelineId);
    res.json({ invitations });
  })
);

/**
 * POST /api/timelines/:timelineId/invitations
 * Create an email invitation (Admin only)
 */
timelineInvitationsRouter.post(
  '/',
  authenticate,
  validateParams(timelineIdParamSchema),
  requireAdmin,
  validate(createInvitationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const invitation = await InvitationService.create(
        req.params.timelineId,
        req.user!.userId,
        req.body
      );
      res.status(201).json(invitation);
    } catch (error) {
      if (error instanceof InvitationError) {
        const statusCode = getStatusCodeForError(error.code);
        return res.status(statusCode).json({
          error: error.code,
          message: error.message,
        });
      }
      throw error;
    }
  })
);

/**
 * POST /api/timelines/:timelineId/invitations/:invitationId/resend
 * Resend invitation email (Admin only)
 */
timelineInvitationsRouter.post(
  '/:invitationId/resend',
  authenticate,
  validateParams(timelineInvitationParamsSchema),
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const invitation = await InvitationService.resend(
        req.params.invitationId,
        req.params.timelineId
      );
      res.json(invitation);
    } catch (error) {
      if (error instanceof InvitationError) {
        const statusCode = getStatusCodeForError(error.code);
        return res.status(statusCode).json({
          error: error.code,
          message: error.message,
        });
      }
      throw error;
    }
  })
);

/**
 * DELETE /api/timelines/:timelineId/invitations/:invitationId
 * Cancel a pending invitation (Admin only)
 */
timelineInvitationsRouter.delete(
  '/:invitationId',
  authenticate,
  validateParams(timelineInvitationParamsSchema),
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = await InvitationService.cancel(
      req.params.invitationId,
      req.params.timelineId
    );

    if (!deleted) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Invitation not found or already processed',
      });
    }

    res.status(204).send();
  })
);

/**
 * GET /api/invitations/validate/:token
 * Validate an invitation token (public endpoint)
 */
publicInvitationsRouter.get(
  '/validate/:token',
  validateParams(tokenParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const validation = await InvitationService.validateToken(req.params.token);
    res.json(validation);
  })
);

/**
 * POST /api/invitations/accept/:token
 * Accept an invitation
 * - For new users: Creates account and adds to timeline
 * - For existing users: Must be authenticated, adds to timeline
 */
publicInvitationsRouter.post(
  '/accept/:token',
  optionalAuth,
  validateParams(tokenParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      // First validate the token to check if it's for an existing user
      const validation = await InvitationService.validateToken(token);

      if (!validation.valid) {
        if (validation.expired) {
          return res.status(400).json({
            error: 'INVITATION_EXPIRED',
            message: 'This invitation has expired. Please request a new invitation from the timeline admin.',
          });
        }
        return res.status(400).json({
          error: 'INVALID_TOKEN',
          message: 'This invitation link is invalid.',
        });
      }

      // Check if this is an existing user invitation
      if (validation.isExistingUser) {
        // Existing user must be authenticated
        if (!req.user) {
          return res.status(401).json({
            error: 'AUTHENTICATION_REQUIRED',
            message: 'Please log in to accept this invitation.',
            isExistingUser: true,
          });
        }

        // Accept for existing user
        const result = await InvitationService.acceptExistingUser(
          token,
          req.user.userId,
          req.user.email
        );
        return res.json(result);
      }

      // New user - validate registration data
      const parseResult = acceptNewUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid registration data',
          details: parseResult.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      // Accept for new user
      const result = await InvitationService.acceptNewUser(token, parseResult.data);
      res.json(result);
    } catch (error) {
      if (error instanceof InvitationError) {
        const statusCode = getStatusCodeForError(error.code);
        return res.status(statusCode).json({
          error: error.code,
          message: error.message,
        });
      }
      throw error;
    }
  })
);

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: string): number {
  switch (code) {
    case 'INVALID_TOKEN':
    case 'INVITATION_EXPIRED':
    case 'INVITATION_CANCELLED':
    case 'VALIDATION_ERROR':
      return 400;
    case 'EMAIL_MISMATCH':
      return 403;
    case 'ALREADY_MEMBER':
      return 409;
    case 'EMAIL_SEND_FAILED':
      return 500;
    default:
      return 500;
  }
}
