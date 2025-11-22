import { JWTPayload } from '../auth/jwt';
import { Timeline, MemberRole } from './timeline';

/**
 * Extend Express Request interface with custom properties
 * Used by authentication and timeline authorization middleware
 */
declare global {
  namespace Express {
    interface Request {
      // Set by authenticate middleware (auth.ts)
      user?: JWTPayload;

      // Set by requireTimelineRole middleware (timelineAuth.ts)
      timeline?: Timeline;
      timelineRole?: MemberRole;
    }
  }
}

// Ensure this file is treated as a module
export {};
