import { query } from '../db/connection';
import {
  Timeline,
  TimelineWithStats,
  TimelineStatus,
  MemberRole,
  CreateTimelineDto,
  UpdateTimelineDto,
  CopyTimelineDto,
  isValidStatusTransition,
  ROLE_HIERARCHY,
} from '../types/timeline';
import { calculateDayOffset, shiftDate } from '../utils/dateShift';

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class TimelineService {
  /**
   * Create a new timeline and assign creator as Admin
   */
  async create(userId: string, data: CreateTimelineDto): Promise<Timeline> {
    const { name, description, startDate, endDate, themeColor = 'blue' } = data;

    // Check for duplicate name for this user
    const existingCheck = await query(
      `SELECT t.id FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE LOWER(t.name) = LOWER($1) AND tm.userId = $2`,
      [name, userId]
    );

    if (existingCheck.rows.length > 0) {
      throw new ConflictError(`A timeline named "${name}" already exists`);
    }

    const result = await query(
      `INSERT INTO timelines (name, description, startDate, endDate, themeColor, ownerId)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || null, startDate, endDate, themeColor, userId]
    );

    const timeline = this.mapRow(result.rows[0]);

    // Add creator as Admin
    await query(
      `INSERT INTO timeline_members (timelineId, userId, role, invitedBy)
       VALUES ($1, $2, 'Admin', $3)`,
      [timeline.id, userId, userId]
    );

    return timeline;
  }

  /**
   * Get all timelines accessible to a user
   */
  async getAccessible(userId: string): Promise<TimelineWithStats[]> {
    const result = await query(
      `SELECT
         t.*,
         tm.role as userRole,
         (SELECT COUNT(*) FROM timeline_members WHERE timelineId = t.id) as memberCount,
         (SELECT COUNT(*) FROM events WHERE timelineId = t.id) as eventCount,
         (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Completed') as completedEventCount
       FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE tm.userId = $1 AND t.status != 'Archived'
       ORDER BY t.updatedAt DESC`,
      [userId]
    );

    return result.rows.map(row => this.mapRowWithStats(row));
  }

  /**
   * Get a single timeline by ID with stats
   */
  async getById(timelineId: string, userId: string): Promise<TimelineWithStats | null> {
    const result = await query(
      `SELECT
         t.*,
         tm.role as userRole,
         (SELECT COUNT(*) FROM timeline_members WHERE timelineId = t.id) as memberCount,
         (SELECT COUNT(*) FROM events WHERE timelineId = t.id) as eventCount,
         (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Completed') as completedEventCount
       FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE t.id = $1 AND tm.userId = $2`,
      [timelineId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowWithStats(result.rows[0]);
  }

  /**
   * Verify user has access to timeline and meets minimum role requirement
   */
  async verifyAccess(
    userId: string,
    timelineId: string,
    minRole: MemberRole = 'Viewer'
  ): Promise<{ role: MemberRole; timeline: Timeline }> {
    const result = await query(
      `SELECT t.*, tm.role
       FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE t.id = $1 AND tm.userId = $2`,
      [timelineId, userId]
    );

    if (result.rows.length === 0) {
      throw new ForbiddenError('Access denied to this timeline');
    }

    const row = result.rows[0];
    const userRole = row.role as MemberRole;

    if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
      throw new ForbiddenError(`Requires ${minRole} role`);
    }

    return { role: userRole, timeline: this.mapRow(row) };
  }

  /**
   * Update a timeline with optimistic locking
   */
  async update(
    timelineId: string,
    data: UpdateTimelineDto,
    expectedUpdatedAt?: string
  ): Promise<Timeline> {
    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.startDate !== undefined) {
      fields.push(`startDate = $${paramCount++}`);
      values.push(data.startDate);
    }
    if (data.endDate !== undefined) {
      fields.push(`endDate = $${paramCount++}`);
      values.push(data.endDate);
    }
    if (data.themeColor !== undefined) {
      fields.push(`themeColor = $${paramCount++}`);
      values.push(data.themeColor);
    }
    if (data.status !== undefined) {
      // Validate status transition
      const current = await query('SELECT status FROM timelines WHERE id = $1', [timelineId]);
      if (current.rows.length > 0) {
        const currentStatus = current.rows[0].status as TimelineStatus;
        if (!isValidStatusTransition(currentStatus, data.status)) {
          throw new ConflictError(
            `Cannot transition from ${currentStatus} to ${data.status}`
          );
        }
      }
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (fields.length === 0) {
      const existing = await query('SELECT * FROM timelines WHERE id = $1', [timelineId]);
      return this.mapRow(existing.rows[0]);
    }

    values.push(timelineId);

    // Optimistic locking check
    let sql = `
      UPDATE timelines
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
    `;

    if (expectedUpdatedAt) {
      // Truncate to milliseconds for comparison (PostgreSQL stores microseconds, JS Date has milliseconds)
      sql += ` AND date_trunc('milliseconds', updatedAt) = date_trunc('milliseconds', $${paramCount + 1}::timestamptz)`;
      values.push(expectedUpdatedAt);
    }

    sql += ' RETURNING *';

    const result = await query(sql, values);

    if (result.rows.length === 0) {
      if (expectedUpdatedAt) {
        throw new ConflictError(
          'Timeline was modified by another user. Please refresh and try again.'
        );
      }
      throw new Error('Timeline not found');
    }

    return this.mapRow(result.rows[0]);
  }

  /**
   * Delete a timeline and all its contents
   */
  async delete(timelineId: string): Promise<boolean> {
    // CASCADE will handle events, categories, and members
    const result = await query(
      'DELETE FROM timelines WHERE id = $1 RETURNING id',
      [timelineId]
    );
    return result.rows.length > 0;
  }

  /**
   * Set template status
   */
  async setTemplate(timelineId: string, isTemplate: boolean): Promise<Timeline> {
    const result = await query(
      `UPDATE timelines SET isTemplate = $1 WHERE id = $2 RETURNING *`,
      [isTemplate, timelineId]
    );
    return this.mapRow(result.rows[0]);
  }

  /**
   * Get all templates (visible to all users)
   */
  async getTemplates(): Promise<TimelineWithStats[]> {
    const result = await query(
      `SELECT
         t.*,
         NULL as userRole,
         (SELECT COUNT(*) FROM timeline_members WHERE timelineId = t.id) as memberCount,
         (SELECT COUNT(*) FROM events WHERE timelineId = t.id) as eventCount,
         (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Completed') as completedEventCount
       FROM timelines t
       WHERE t.isTemplate = true
       ORDER BY t.name ASC`
    );

    return result.rows.map(row => this.mapRowWithStats(row));
  }

  /**
   * Unarchive a timeline (return to Completed status)
   */
  async unarchive(timelineId: string): Promise<Timeline> {
    const current = await query('SELECT status FROM timelines WHERE id = $1', [timelineId]);

    if (current.rows.length === 0) {
      throw new Error('Timeline not found');
    }

    if (current.rows[0].status !== 'Archived') {
      throw new ConflictError('Only archived timelines can be unarchived');
    }

    const result = await query(
      `UPDATE timelines SET status = 'Completed' WHERE id = $1 RETURNING *`,
      [timelineId]
    );

    return this.mapRow(result.rows[0]);
  }

  /**
   * Copy a timeline with all its content and shift dates
   * T070: Implement timeline copy with date shifting
   */
  async copy(
    sourceTimelineId: string,
    userId: string,
    options: CopyTimelineDto
  ): Promise<Timeline> {
    const {
      name,
      startDate,
      endDate,
      includeCategories = true,
      includeEvents = true,
      includeAssignments = true,
    } = options;

    // Get source timeline
    const sourceResult = await query(
      'SELECT * FROM timelines WHERE id = $1',
      [sourceTimelineId]
    );

    if (sourceResult.rows.length === 0) {
      throw new Error('Source timeline not found');
    }

    const source = sourceResult.rows[0];

    // Check for duplicate name for this user
    const existingCheck = await query(
      `SELECT t.id FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE LOWER(t.name) = LOWER($1) AND tm.userId = $2`,
      [name, userId]
    );

    if (existingCheck.rows.length > 0) {
      throw new ConflictError(`A timeline named "${name}" already exists`);
    }

    // Calculate date offset
    const dayOffset = calculateDayOffset(
      source.startdate instanceof Date
        ? source.startdate.toISOString().split('T')[0]
        : source.startdate,
      startDate
    );

    // Create new timeline
    const newTimelineResult = await query(
      `INSERT INTO timelines (name, description, startDate, endDate, themeColor, status, ownerId)
       VALUES ($1, $2, $3, $4, $5, 'Planning', $6)
       RETURNING *`,
      [name, source.description, startDate, endDate, source.themecolor, userId]
    );

    const newTimeline = this.mapRow(newTimelineResult.rows[0]);

    // Add creator as Admin
    await query(
      `INSERT INTO timeline_members (timelineId, userId, role, invitedBy)
       VALUES ($1, $2, 'Admin', $3)`,
      [newTimeline.id, userId, userId]
    );

    // Map old category IDs to new category IDs
    const categoryIdMap = new Map<string, string>();

    // Copy categories if requested
    if (includeCategories) {
      const categoriesResult = await query(
        'SELECT * FROM categories WHERE timelineId = $1',
        [sourceTimelineId]
      );

      for (const cat of categoriesResult.rows) {
        const newCatResult = await query(
          `INSERT INTO categories (timelineId, name, color, createdBy)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [newTimeline.id, cat.name, cat.color, userId]
        );
        categoryIdMap.set(cat.id, newCatResult.rows[0].id);
      }
    }

    // Copy events if requested
    if (includeEvents && includeCategories) {
      const eventsResult = await query(
        'SELECT * FROM events WHERE timelineId = $1',
        [sourceTimelineId]
      );

      // Process events in batches of 50 (T070.1)
      const BATCH_SIZE = 50;
      const events = eventsResult.rows;

      for (let i = 0; i < events.length; i += BATCH_SIZE) {
        const batch = events.slice(i, i + BATCH_SIZE);

        for (const event of batch) {
          let newCategoryId = categoryIdMap.get(event.categoryid);

          // If category wasn't copied (e.g., from another timeline), copy it now
          if (!newCategoryId && event.categoryid) {
            const originalCatResult = await query(
              'SELECT * FROM categories WHERE id = $1',
              [event.categoryid]
            );

            if (originalCatResult.rows.length > 0) {
              const originalCat = originalCatResult.rows[0];
              const newCatResult = await query(
                `INSERT INTO categories (timelineId, name, color, createdBy)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [newTimeline.id, originalCat.name, originalCat.color, userId]
              );
              newCategoryId = newCatResult.rows[0].id;
              if (newCategoryId) {
                categoryIdMap.set(event.categoryid, newCategoryId);
              }
            }
          }

          // Skip if still no category (category was deleted)
          if (!newCategoryId) continue;

          // Shift event date
          const originalDate =
            event.date instanceof Date
              ? event.date.toISOString().split('T')[0]
              : event.date;
          const newDate = shiftDate(originalDate, dayOffset);

          await query(
            `INSERT INTO events (
              timelineId, title, date, time, endTime, description,
              categoryId, assignedPerson, status, priority,
              sourceEventId, createdBy
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Not Started', $9, $10, $11)`,
            [
              newTimeline.id,
              event.title,
              newDate,
              event.time,
              event.endtime,
              event.description,
              newCategoryId,
              includeAssignments ? event.assignedperson : null,
              event.priority,
              event.id, // sourceEventId - link to original
              userId,
            ]
          );
        }
      }
    }

    return newTimeline;
  }

  /**
   * Map database row to Timeline object
   */
  private mapRow(row: any): Timeline {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      startDate: row.startdate instanceof Date
        ? row.startdate.toISOString().split('T')[0]
        : row.startdate,
      endDate: row.enddate instanceof Date
        ? row.enddate.toISOString().split('T')[0]
        : row.enddate,
      themeColor: row.themecolor,
      status: row.status as TimelineStatus,
      isTemplate: row.istemplate,
      ownerId: row.ownerid,
      createdAt: row.createdat instanceof Date
        ? row.createdat.toISOString()
        : row.createdat,
      updatedAt: row.updatedat instanceof Date
        ? row.updatedat.toISOString()
        : row.updatedat,
    };
  }

  /**
   * Map database row to TimelineWithStats object
   */
  private mapRowWithStats(row: any): TimelineWithStats {
    const timeline = this.mapRow(row);
    const eventCount = parseInt(row.eventcount, 10) || 0;
    const completedEventCount = parseInt(row.completedeventcount, 10) || 0;

    return {
      ...timeline,
      memberCount: parseInt(row.membercount, 10) || 0,
      eventCount,
      completedEventCount,
      completionPercentage: eventCount > 0
        ? Math.round((completedEventCount / eventCount) * 100)
        : 0,
      userRole: row.userrole as MemberRole | undefined,
    };
  }
}

export default new TimelineService();
