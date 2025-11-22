import { Request, Response, NextFunction } from 'express';
import TimelineService, { ForbiddenError } from '../services/TimelineService';
import { MemberRole, Timeline } from '../types/timeline';

// Extend Express Request to include timeline and role
declare global {
  namespace Express {
    interface Request {
      timeline?: Timeline;
      timelineRole?: MemberRole;
    }
  }
}

/**
 * Timeline authorization middleware factory
 * Verifies user has access to the timeline and meets minimum role requirement
 *
 * @param minRole - Minimum role required ('Viewer' | 'Editor' | 'Admin')
 * @returns Express middleware function
 *
 * Usage:
 *   router.get('/timelines/:timelineId', authenticate, requireTimelineRole('Viewer'), handler)
 *   router.post('/timelines/:timelineId/events', authenticate, requireTimelineRole('Editor'), handler)
 *   router.delete('/timelines/:timelineId', authenticate, requireTimelineRole('Admin'), handler)
 */
export function requireTimelineRole(minRole: MemberRole = 'Viewer') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timelineId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!timelineId) {
        return res.status(400).json({ error: 'Timeline ID is required' });
      }

      // Verify access and get role
      const { role, timeline } = await TimelineService.verifyAccess(
        userId,
        timelineId,
        minRole
      );

      // Check if timeline is archived and user is trying to modify
      if (timeline.status === 'Archived' && role !== 'Admin') {
        // Allow GET requests (read-only access)
        if (req.method !== 'GET') {
          return res.status(403).json({
            error: 'Timeline is archived and read-only',
            code: 'TIMELINE_ARCHIVED',
          });
        }
      }

      // Attach timeline and role to request for use in handlers
      req.timeline = timeline;
      req.timelineRole = role;

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          error: error.message,
          code: 'ACCESS_DENIED',
        });
      }

      // Pass other errors to error handler
      next(error);
    }
  };
}

/**
 * Check if current user is timeline owner
 * Use after requireTimelineRole for owner-only operations
 */
export function requireTimelineOwner() {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const timeline = req.timeline;

    if (!timeline) {
      return res.status(500).json({ error: 'Timeline context not available' });
    }

    if (timeline.ownerId !== userId) {
      return res.status(403).json({
        error: 'Only the timeline owner can perform this action',
        code: 'OWNER_REQUIRED',
      });
    }

    next();
  };
}

/**
 * Check if timeline is in a specific status
 * Use for status-dependent features (e.g., retrospective only on Completed/Archived)
 */
export function requireTimelineStatus(allowedStatuses: Timeline['status'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeline = req.timeline;

    if (!timeline) {
      return res.status(500).json({ error: 'Timeline context not available' });
    }

    if (!allowedStatuses.includes(timeline.status)) {
      return res.status(403).json({
        error: `This action requires timeline status to be: ${allowedStatuses.join(' or ')}`,
        code: 'INVALID_STATUS',
        currentStatus: timeline.status,
      });
    }

    next();
  };
}

/**
 * Convenience middleware for common role checks
 */
export const requireViewer = requireTimelineRole('Viewer');
export const requireEditor = requireTimelineRole('Editor');
export const requireAdmin = requireTimelineRole('Admin');
