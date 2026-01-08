import crypto from 'crypto';
import { query, getClient } from '../db/connection';
import { hashPassword, comparePassword } from '../auth/password';
import { generateToken } from '../auth/jwt';
import { MemberRole } from '../types/timeline';
import {
  TimelineInvitationPublic,
  InvitationValidation,
  CreateInvitationDto,
  AcceptNewUserDto,
  AcceptInvitationResponse,
  InvitationError,
} from '../types/invitation';
import emailService from './EmailService';

// Token expiration: 7 days in milliseconds
const TOKEN_EXPIRY_DAYS = 7;

export class InvitationService {
  /**
   * Generate a secure random token for invitation links
   * Uses 32 bytes (256 bits) of entropy, encoded as URL-safe base64
   */
  generateToken(): string {
    const buffer = crypto.randomBytes(32);
    // URL-safe base64 encoding (replace + with -, / with _, remove =)
    return buffer.toString('base64url');
  }

  /**
   * Create a new invitation and send email
   */
  async create(
    timelineId: string,
    invitedByUserId: string,
    data: CreateInvitationDto
  ): Promise<TimelineInvitationPublic> {
    const { email, role } = data;
    const normalizedEmail = email.toLowerCase();

    // Check if user is already a member
    const existingMember = await query(
      `SELECT tm.id FROM timeline_members tm
       JOIN users u ON tm.userId = u.id
       WHERE tm.timelineId = $1 AND LOWER(u.email) = $2`,
      [timelineId, normalizedEmail]
    );

    if (existingMember.rows.length > 0) {
      throw new InvitationError('ALREADY_MEMBER', 'This user is already a member of this timeline');
    }

    // Check if email belongs to an existing user
    const existingUser = await query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    const targetUserId = existingUser.rows.length > 0 ? existingUser.rows[0].id : null;

    // Check for existing pending invitation
    const existingInvitation = await query(
      `SELECT id FROM timeline_invitations
       WHERE timelineId = $1 AND LOWER(email) = $2 AND status = 'pending'`,
      [timelineId, normalizedEmail]
    );

    // Generate token and hash
    const token = this.generateToken();
    const tokenHash = await hashPassword(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    let invitationId: string;

    if (existingInvitation.rows.length > 0) {
      // Update existing pending invitation
      invitationId = existingInvitation.rows[0].id;
      await query(
        `UPDATE timeline_invitations
         SET role = $1, tokenHash = $2, expiresAt = $3, targetUserId = $4, updatedAt = NOW()
         WHERE id = $5`,
        [role, tokenHash, expiresAt, targetUserId, invitationId]
      );
    } else {
      // Create new invitation
      const result = await query(
        `INSERT INTO timeline_invitations
         (email, tokenHash, role, timelineId, invitedBy, targetUserId, expiresAt)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [normalizedEmail, tokenHash, role, timelineId, invitedByUserId, targetUserId, expiresAt]
      );
      invitationId = result.rows[0].id;
    }

    // Get timeline and inviter info for email
    const inviterResult = await query('SELECT name FROM users WHERE id = $1', [invitedByUserId]);
    const timelineResult = await query('SELECT name FROM timelines WHERE id = $1', [timelineId]);

    const inviterName = inviterResult.rows[0]?.name || 'A team member';
    const timelineName = timelineResult.rows[0]?.name || 'a timeline';

    // Send invitation email
    const inviteLink = emailService.generateInviteLink(token);
    const emailSent = await emailService.sendInvitation({
      to: normalizedEmail,
      inviterName,
      timelineName,
      role,
      inviteLink,
    });

    if (!emailSent) {
      // Rollback: delete the invitation if email failed
      await query('DELETE FROM timeline_invitations WHERE id = $1', [invitationId]);
      throw new InvitationError('EMAIL_SEND_FAILED', 'Failed to send invitation email. Please try again.');
    }

    // Return public invitation data
    return {
      id: invitationId,
      email: normalizedEmail,
      role,
      status: 'pending',
      timelineId,
      timelineName,
      invitedByName: inviterName,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Validate an invitation token
   * Returns validation info without accepting the invitation
   */
  async validateToken(token: string): Promise<InvitationValidation> {
    // Find all pending invitations and check token against each
    // We need to do this because we can't query by token (it's hashed)
    const result = await query(
      `SELECT
         ti.*,
         t.name as timeline_name,
         u.name as inviter_name,
         (SELECT id FROM users WHERE LOWER(email) = LOWER(ti.email)) as existing_user_id
       FROM timeline_invitations ti
       JOIN timelines t ON ti.timelineId = t.id
       JOIN users u ON ti.invitedBy = u.id
       WHERE ti.status = 'pending'`,
      []
    );

    for (const row of result.rows) {
      const isMatch = await comparePassword(token, row.tokenhash);
      if (isMatch) {
        const expiresAt = new Date(row.expiresat);
        const isExpired = expiresAt < new Date();

        if (isExpired) {
          // Mark as expired
          await query(
            "UPDATE timeline_invitations SET status = 'expired' WHERE id = $1",
            [row.id]
          );
          return {
            valid: false,
            expired: true,
          };
        }

        return {
          valid: true,
          email: row.email,
          role: row.role as MemberRole,
          timelineId: row.timelineid,
          timelineName: row.timeline_name,
          inviterName: row.inviter_name,
          isExistingUser: !!row.existing_user_id,
        };
      }
    }

    return { valid: false };
  }

  /**
   * Accept invitation for a new user (creates account)
   */
  async acceptNewUser(
    token: string,
    data: AcceptNewUserDto
  ): Promise<AcceptInvitationResponse> {
    const { name, password } = data;

    // Find and validate the invitation
    const validation = await this.validateToken(token);
    if (!validation.valid) {
      if (validation.expired) {
        throw new InvitationError('INVITATION_EXPIRED', 'This invitation has expired. Please request a new invitation from the timeline admin.');
      }
      throw new InvitationError('INVALID_TOKEN', 'This invitation link is invalid.');
    }

    // Get the invitation ID by matching token again
    const invitationResult = await query(
      `SELECT id, email, role, timelineId, invitedBy FROM timeline_invitations WHERE status = 'pending'`,
      []
    );

    let invitation: any = null;
    for (const row of invitationResult.rows) {
      const isMatch = await comparePassword(token, row.tokenhash || '');
      if (isMatch) {
        invitation = row;
        break;
      }
    }

    // Need to re-query since we don't have tokenhash in the simple query
    const fullInvitationResult = await query(
      `SELECT * FROM timeline_invitations WHERE status = 'pending'`,
      []
    );

    for (const row of fullInvitationResult.rows) {
      const isMatch = await comparePassword(token, row.tokenhash);
      if (isMatch) {
        invitation = row;
        break;
      }
    }

    if (!invitation) {
      throw new InvitationError('INVALID_TOKEN', 'This invitation link is invalid.');
    }

    // Check if user with this email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [invitation.email]
    );

    if (existingUser.rows.length > 0) {
      throw new InvitationError('EMAIL_MISMATCH', 'An account with this email already exists. Please log in to accept the invitation.');
    }

    // Start transaction
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Create user
      const passwordHash = await hashPassword(password);
      const userResult = await client.query(
        `INSERT INTO users (email, passwordHash, name)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, createdAt, updatedAt`,
        [invitation.email, passwordHash, name]
      );
      const user = userResult.rows[0];

      // Update invitation
      await client.query(
        `UPDATE timeline_invitations
         SET status = 'accepted', acceptedAt = NOW(), acceptedByUserId = $1
         WHERE id = $2`,
        [user.id, invitation.id]
      );

      // Create timeline membership
      await client.query(
        `INSERT INTO timeline_members (timelineId, userId, role, invitedBy)
         VALUES ($1, $2, $3, $4)`,
        [invitation.timelineid, user.id, invitation.role, invitation.invitedby]
      );

      // Get timeline info
      const timelineResult = await client.query(
        'SELECT id, name, description FROM timelines WHERE id = $1',
        [invitation.timelineid]
      );
      const timeline = timelineResult.rows[0];

      await client.query('COMMIT');

      // Generate JWT token for auto-login
      const jwtToken = generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        timeline: {
          id: timeline.id,
          name: timeline.name,
          description: timeline.description,
        },
        role: invitation.role as MemberRole,
        token: jwtToken,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Accept invitation for an existing user
   */
  async acceptExistingUser(
    token: string,
    userId: string,
    userEmail: string
  ): Promise<AcceptInvitationResponse> {
    // Find and validate the invitation
    const validation = await this.validateToken(token);
    if (!validation.valid) {
      if (validation.expired) {
        throw new InvitationError('INVITATION_EXPIRED', 'This invitation has expired. Please request a new invitation from the timeline admin.');
      }
      throw new InvitationError('INVALID_TOKEN', 'This invitation link is invalid.');
    }

    // Verify email matches
    if (validation.email?.toLowerCase() !== userEmail.toLowerCase()) {
      throw new InvitationError('EMAIL_MISMATCH', 'This invitation was sent to a different email address. Please log in with the correct account.');
    }

    // Get the invitation
    const invitationResult = await query(
      `SELECT * FROM timeline_invitations WHERE status = 'pending'`,
      []
    );

    let invitation: any = null;
    for (const row of invitationResult.rows) {
      const isMatch = await comparePassword(token, row.tokenhash);
      if (isMatch) {
        invitation = row;
        break;
      }
    }

    if (!invitation) {
      throw new InvitationError('INVALID_TOKEN', 'This invitation link is invalid.');
    }

    // Check if user is already a member
    const existingMember = await query(
      'SELECT id FROM timeline_members WHERE timelineId = $1 AND userId = $2',
      [invitation.timelineid, userId]
    );

    if (existingMember.rows.length > 0) {
      throw new InvitationError('ALREADY_MEMBER', 'You are already a member of this timeline.');
    }

    // Start transaction
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Update invitation
      await client.query(
        `UPDATE timeline_invitations
         SET status = 'accepted', acceptedAt = NOW(), acceptedByUserId = $1
         WHERE id = $2`,
        [userId, invitation.id]
      );

      // Create timeline membership
      await client.query(
        `INSERT INTO timeline_members (timelineId, userId, role, invitedBy)
         VALUES ($1, $2, $3, $4)`,
        [invitation.timelineid, userId, invitation.role, invitation.invitedby]
      );

      // Get user and timeline info
      const userResult = await client.query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [userId]
      );
      const user = userResult.rows[0];

      const timelineResult = await client.query(
        'SELECT id, name, description FROM timelines WHERE id = $1',
        [invitation.timelineid]
      );
      const timeline = timelineResult.rows[0];

      await client.query('COMMIT');

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        timeline: {
          id: timeline.id,
          name: timeline.name,
          description: timeline.description,
        },
        role: invitation.role as MemberRole,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * List pending invitations for a timeline
   */
  async listPending(timelineId: string): Promise<TimelineInvitationPublic[]> {
    const result = await query(
      `SELECT
         ti.id, ti.email, ti.role, ti.status, ti.expiresAt, ti.createdAt,
         u.name as invitedByName,
         t.name as timelineName
       FROM timeline_invitations ti
       JOIN users u ON ti.invitedBy = u.id
       JOIN timelines t ON ti.timelineId = t.id
       WHERE ti.timelineId = $1 AND ti.status = 'pending'
       ORDER BY ti.createdAt DESC`,
      [timelineId]
    );

    return result.rows.map(row => this.mapRowToPublic(row));
  }

  /**
   * Resend an invitation email
   */
  async resend(invitationId: string, timelineId: string): Promise<TimelineInvitationPublic> {
    const result = await query(
      `SELECT
         ti.*,
         u.name as invitedByName,
         t.name as timelineName
       FROM timeline_invitations ti
       JOIN users u ON ti.invitedBy = u.id
       JOIN timelines t ON ti.timelineId = t.id
       WHERE ti.id = $1 AND ti.timelineId = $2 AND ti.status = 'pending'`,
      [invitationId, timelineId]
    );

    if (result.rows.length === 0) {
      throw new InvitationError('INVALID_TOKEN', 'Invitation not found or already used.');
    }

    const invitation = result.rows[0];

    // Generate new token
    const token = this.generateToken();
    const tokenHash = await hashPassword(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Update invitation with new token
    await query(
      `UPDATE timeline_invitations
       SET tokenHash = $1, expiresAt = $2, updatedAt = NOW()
       WHERE id = $3`,
      [tokenHash, expiresAt, invitationId]
    );

    // Send email
    const inviteLink = emailService.generateInviteLink(token);
    const emailSent = await emailService.sendInvitation({
      to: invitation.email,
      inviterName: invitation.invitedbyname,
      timelineName: invitation.timelinename,
      role: invitation.role,
      inviteLink,
    });

    if (!emailSent) {
      throw new InvitationError('EMAIL_SEND_FAILED', 'Failed to resend invitation email. Please try again.');
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role as MemberRole,
      status: 'pending',
      timelineId: invitation.timelineid,
      timelineName: invitation.timelinename,
      invitedByName: invitation.invitedbyname,
      expiresAt: expiresAt.toISOString(),
      createdAt: invitation.createdat instanceof Date
        ? invitation.createdat.toISOString()
        : invitation.createdat,
    };
  }

  /**
   * Cancel a pending invitation
   */
  async cancel(invitationId: string, timelineId: string): Promise<boolean> {
    const result = await query(
      `UPDATE timeline_invitations
       SET status = 'cancelled', updatedAt = NOW()
       WHERE id = $1 AND timelineId = $2 AND status = 'pending'
       RETURNING id`,
      [invitationId, timelineId]
    );

    return result.rows.length > 0;
  }

  /**
   * Map database row to TimelineInvitationPublic
   */
  private mapRowToPublic(row: any): TimelineInvitationPublic {
    return {
      id: row.id,
      email: row.email,
      role: row.role as MemberRole,
      status: row.status,
      timelineId: row.timelineid,
      timelineName: row.timelinename,
      invitedByName: row.invitedbyname,
      expiresAt: row.expiresat instanceof Date
        ? row.expiresat.toISOString()
        : row.expiresat,
      createdAt: row.createdat instanceof Date
        ? row.createdat.toISOString()
        : row.createdat,
    };
  }
}

export default new InvitationService();
