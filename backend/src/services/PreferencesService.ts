/**
 * Preferences Service
 * Feature: 001-multi-timeline-system (User Story 4)
 *
 * Handles user preferences including last active timeline
 */

import { query } from '../db/connection';
import { UserPreference } from '../types/timeline';

export class PreferencesService {
  /**
   * Map database row to UserPreference object
   */
  private mapRow(row: Record<string, unknown>): UserPreference {
    return {
      id: row.id as string,
      userId: row.userid as string,
      lastTimelineId: (row.lasttimelineid as string) || null,
      updatedAt: (row.updatedat as Date).toISOString(),
    };
  }

  /**
   * Get user preferences by user ID
   * Returns null if no preferences exist yet
   */
  async get(userId: string): Promise<UserPreference | null> {
    const result = await query(
      `SELECT id, userId, lastTimelineId, updatedAt
       FROM user_preferences
       WHERE userId = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  /**
   * Create or update user preferences
   * Uses UPSERT to handle both cases
   */
  async upsert(
    userId: string,
    lastTimelineId: string | null
  ): Promise<UserPreference> {
    // Validate that the timeline exists and user has access
    if (lastTimelineId) {
      const accessCheck = await query(
        `SELECT 1 FROM timeline_members
         WHERE timelineId = $1 AND userId = $2`,
        [lastTimelineId, userId]
      );

      if (accessCheck.rows.length === 0) {
        throw new Error('Cannot set preference: no access to timeline');
      }

      // Also check that timeline is not archived
      const archivedCheck = await query(
        `SELECT status FROM timelines WHERE id = $1`,
        [lastTimelineId]
      );

      if (archivedCheck.rows[0]?.status === 'Archived') {
        throw new Error('Cannot set preference: timeline is archived');
      }
    }

    const result = await query(
      `INSERT INTO user_preferences (userId, lastTimelineId)
       VALUES ($1, $2)
       ON CONFLICT (userId)
       DO UPDATE SET
         lastTimelineId = EXCLUDED.lastTimelineId,
         updatedAt = NOW()
       RETURNING id, userId, lastTimelineId, updatedAt`,
      [userId, lastTimelineId]
    );

    return this.mapRow(result.rows[0]);
  }

  /**
   * Update only the lastTimelineId preference
   * T055: Implement PreferencesService.update()
   */
  async update(
    userId: string,
    lastTimelineId: string | null
  ): Promise<UserPreference> {
    return this.upsert(userId, lastTimelineId);
  }

  /**
   * Clear user's last timeline preference
   * T115: Used when user loses access to a timeline
   */
  async clearLastTimeline(userId: string): Promise<void> {
    await query(
      `UPDATE user_preferences
       SET lastTimelineId = NULL, updatedAt = NOW()
       WHERE userId = $1`,
      [userId]
    );
  }

  /**
   * Clear preferences for all users who had a specific timeline as their last
   * Used when a timeline is deleted or archived
   */
  async clearTimelineFromAllPreferences(timelineId: string): Promise<void> {
    await query(
      `UPDATE user_preferences
       SET lastTimelineId = NULL, updatedAt = NOW()
       WHERE lastTimelineId = $1`,
      [timelineId]
    );
  }

  /**
   * Clear preference when user loses access to timeline
   * Called when member is removed from a timeline
   */
  async clearIfMatchesTimeline(
    userId: string,
    timelineId: string
  ): Promise<void> {
    await query(
      `UPDATE user_preferences
       SET lastTimelineId = NULL, updatedAt = NOW()
       WHERE userId = $1 AND lastTimelineId = $2`,
      [userId, timelineId]
    );
  }
}

export const preferencesService = new PreferencesService();
