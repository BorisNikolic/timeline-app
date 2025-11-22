import { query } from '../db/connection';
import {
  TimelineMember,
  TimelineMemberWithUser,
  MemberRole,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from '../types/timeline';
import { preferencesService } from './PreferencesService';

export class LastAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LastAdminError';
  }
}

export class MemberService {
  /**
   * Get user's membership in a timeline
   */
  async getMembership(userId: string, timelineId: string): Promise<TimelineMember | null> {
    const result = await query(
      `SELECT * FROM timeline_members WHERE userId = $1 AND timelineId = $2`,
      [userId, timelineId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  /**
   * Get all members of a timeline with user details
   */
  async getMembers(timelineId: string): Promise<TimelineMemberWithUser[]> {
    const result = await query(
      `SELECT
         tm.*,
         u.id as user_id,
         u.name as user_name,
         u.email as user_email
       FROM timeline_members tm
       JOIN users u ON tm.userId = u.id
       WHERE tm.timelineId = $1
       ORDER BY
         CASE tm.role
           WHEN 'Admin' THEN 1
           WHEN 'Editor' THEN 2
           WHEN 'Viewer' THEN 3
         END,
         tm.joinedAt ASC`,
      [timelineId]
    );

    return result.rows.map(row => this.mapRowWithUser(row));
  }

  /**
   * Invite a user to a timeline
   */
  async inviteMember(
    timelineId: string,
    invitedByUserId: string,
    data: InviteMemberDto
  ): Promise<TimelineMemberWithUser> {
    const { userId, role } = data;

    // Check if user is already a member
    const existing = await this.getMembership(userId, timelineId);
    if (existing) {
      throw new Error('User is already a member of this timeline');
    }

    const result = await query(
      `INSERT INTO timeline_members (timelineId, userId, role, invitedBy)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [timelineId, userId, role, invitedByUserId]
    );

    // Get member with user details
    const memberWithUser = await query(
      `SELECT
         tm.*,
         u.id as user_id,
         u.name as user_name,
         u.email as user_email
       FROM timeline_members tm
       JOIN users u ON tm.userId = u.id
       WHERE tm.id = $1`,
      [result.rows[0].id]
    );

    return this.mapRowWithUser(memberWithUser.rows[0]);
  }

  /**
   * Update a member's role
   */
  async updateRole(
    timelineId: string,
    targetUserId: string,
    data: UpdateMemberRoleDto
  ): Promise<TimelineMemberWithUser> {
    const { role: newRole } = data;

    // Check if this would remove the last admin
    if (newRole !== 'Admin') {
      await this.ensureNotLastAdmin(timelineId, targetUserId);
    }

    const result = await query(
      `UPDATE timeline_members
       SET role = $1
       WHERE timelineId = $2 AND userId = $3
       RETURNING *`,
      [newRole, timelineId, targetUserId]
    );

    if (result.rows.length === 0) {
      throw new Error('Member not found');
    }

    // Get member with user details
    const memberWithUser = await query(
      `SELECT
         tm.*,
         u.id as user_id,
         u.name as user_name,
         u.email as user_email
       FROM timeline_members tm
       JOIN users u ON tm.userId = u.id
       WHERE tm.id = $1`,
      [result.rows[0].id]
    );

    return this.mapRowWithUser(memberWithUser.rows[0]);
  }

  /**
   * Remove a member from a timeline
   */
  async removeMember(timelineId: string, targetUserId: string): Promise<boolean> {
    // Check if this would remove the last admin
    await this.ensureNotLastAdmin(timelineId, targetUserId);

    const result = await query(
      `DELETE FROM timeline_members WHERE timelineId = $1 AND userId = $2 RETURNING id`,
      [timelineId, targetUserId]
    );

    // T115: Clear timeline preference if user had this as last timeline
    if (result.rows.length > 0) {
      await preferencesService.clearIfMatchesTimeline(targetUserId, timelineId);
    }

    return result.rows.length > 0;
  }

  /**
   * User leaves a timeline
   */
  async leaveTimeline(userId: string, timelineId: string): Promise<boolean> {
    // Check if this would remove the last admin
    await this.ensureNotLastAdmin(timelineId, userId);

    const result = await query(
      `DELETE FROM timeline_members WHERE timelineId = $1 AND userId = $2 RETURNING id`,
      [timelineId, userId]
    );

    // T115: Clear timeline preference if user had this as last timeline
    if (result.rows.length > 0) {
      await preferencesService.clearIfMatchesTimeline(userId, timelineId);
    }

    return result.rows.length > 0;
  }

  /**
   * Ensure removing/demoting a user won't leave timeline without admin
   */
  private async ensureNotLastAdmin(timelineId: string, userId: string): Promise<void> {
    // Get current member's role
    const member = await this.getMembership(userId, timelineId);
    if (!member || member.role !== 'Admin') {
      // Not an admin, no risk of removing last admin
      return;
    }

    // Count remaining admins after potential removal
    const adminCount = await query(
      `SELECT COUNT(*) as count FROM timeline_members
       WHERE timelineId = $1 AND role = 'Admin' AND userId != $2`,
      [timelineId, userId]
    );

    if (parseInt(adminCount.rows[0].count, 10) === 0) {
      throw new LastAdminError(
        'Cannot remove or demote the last admin. Assign another admin first.'
      );
    }
  }

  /**
   * Map database row to TimelineMember
   */
  private mapRow(row: any): TimelineMember {
    return {
      id: row.id,
      timelineId: row.timelineid,
      userId: row.userid,
      role: row.role as MemberRole,
      invitedBy: row.invitedby,
      joinedAt: row.joinedat instanceof Date
        ? row.joinedat.toISOString()
        : row.joinedat,
    };
  }

  /**
   * Map database row to TimelineMemberWithUser
   */
  private mapRowWithUser(row: any): TimelineMemberWithUser {
    return {
      ...this.mapRow(row),
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
      },
    };
  }
}

export default new MemberService();
