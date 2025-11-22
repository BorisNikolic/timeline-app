import { query } from '../db/connection';
import {
  Event,
  EventWithDetails,
  CreateEventDto,
  UpdateEventDto,
  EventStatus,
  EventPriority,
  OutcomeTag,
} from '../models/Event';

// Timeline status type for retrospective validation
type TimelineStatus = 'Planning' | 'Active' | 'Completed' | 'Archived';

export class EventService {
  /**
   * Create a new event
   * @param userId - User creating the event
   * @param data - Event data
   * @param timelineId - Optional timeline ID (for timeline-scoped creation)
   */
  async createEvent(userId: string, data: CreateEventDto, timelineId?: string): Promise<Event> {
    const {
      title,
      date,
      time,
      endTime,
      description,
      categoryId,
      assignedPerson,
      status = EventStatus.NotStarted,
      priority = EventPriority.Medium,
    } = data;

    // If timelineId is provided, use it. Otherwise, get from category for backward compatibility
    let eventTimelineId = timelineId;
    if (!eventTimelineId) {
      const categoryResult = await query(
        'SELECT timelineId FROM categories WHERE id = $1',
        [categoryId]
      );
      if (categoryResult.rows.length === 0) {
        throw new Error('Category not found');
      }
      eventTimelineId = categoryResult.rows[0].timelineid;
    }

    const result = await query(
      `INSERT INTO events (title, date, time, endTime, description, categoryId, timelineId, assignedPerson, status, priority, createdBy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, date, time, endTime, description, categoryId, eventTimelineId, assignedPerson, status, priority, userId]
    );

    return this.mapRowToEvent(result.rows[0]);
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<Event | null> {
    const result = await query('SELECT * FROM events WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEvent(result.rows[0]);
  }

  /**
   * Get events by timeline ID with optional filtering and sorting (T098)
   */
  async getByTimeline(
    timelineId: string,
    options: {
      startDate?: string;
      endDate?: string;
      sortBy?: 'date' | 'urgency' | 'priority';
      status?: EventStatus;
      priority?: EventPriority;
      categoryId?: string;
      assignedPerson?: string;
      outcomeTag?: OutcomeTag;
    } = {}
  ): Promise<EventWithDetails[]> {
    const { startDate, endDate, sortBy, status, priority, categoryId, assignedPerson, outcomeTag } = options;

    let sql = `
      SELECT
        e.*,
        c.name as categoryName,
        c.color as categoryColor,
        u.name as createdByName
      FROM events e
      JOIN categories c ON e.categoryId = c.id
      JOIN users u ON e.createdBy = u.id
      WHERE e.timelineId = $1
    `;

    const params: any[] = [timelineId];
    let paramIndex = 2;

    // Date range filtering
    if (startDate && endDate) {
      sql += ` AND e.date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    } else if (startDate) {
      sql += ` AND e.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    } else if (endDate) {
      sql += ` AND e.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Status filtering
    if (status) {
      sql += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Priority filtering
    if (priority) {
      sql += ` AND e.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    // Category filtering
    if (categoryId) {
      sql += ` AND e.categoryId = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    // Assigned person filtering
    if (assignedPerson) {
      sql += ` AND e.assignedPerson ILIKE $${paramIndex}`;
      params.push(`%${assignedPerson}%`);
      paramIndex++;
    }

    // Outcome tag filtering (US8)
    if (outcomeTag) {
      sql += ` AND e.outcomeTag = $${paramIndex}`;
      params.push(outcomeTag);
      paramIndex++;
    }

    // Sorting
    switch (sortBy) {
      case 'urgency':
        sql += ' ORDER BY ABS(EXTRACT(EPOCH FROM (e.date - CURRENT_DATE))) ASC';
        break;
      case 'priority':
        sql += ` ORDER BY
          CASE e.priority
            WHEN 'High' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'Low' THEN 3
          END ASC, e.date ASC`;
        break;
      case 'date':
      default:
        sql += ' ORDER BY e.date ASC';
        break;
    }

    const result = await query(sql, params);
    return result.rows.map(this.mapRowToEventWithDetails);
  }

  /**
   * Get all events with optional filtering and sorting
   */
  async getEvents(
    startDate?: string,
    endDate?: string,
    sortBy?: 'date' | 'urgency' | 'priority',
    status?: EventStatus,
    priority?: EventPriority,
    categoryId?: string,
    assignedPerson?: string,
    outcomeTag?: OutcomeTag // US8: Filter by retrospective outcome tag
  ): Promise<EventWithDetails[]> {
    let sql = `
      SELECT
        e.*,
        c.name as categoryName,
        c.color as categoryColor,
        u.name as createdByName
      FROM events e
      JOIN categories c ON e.categoryId = c.id
      JOIN users u ON e.createdBy = u.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    // Date range filtering
    if (startDate && endDate) {
      conditions.push(`e.date BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(startDate, endDate);
      paramIndex += 2;
    } else if (startDate) {
      conditions.push(`e.date >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    } else if (endDate) {
      conditions.push(`e.date <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    // Status filtering
    if (status) {
      conditions.push(`e.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Priority filtering
    if (priority) {
      conditions.push(`e.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    // Category filtering
    if (categoryId) {
      conditions.push(`e.categoryId = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    // Assigned person filtering
    if (assignedPerson) {
      conditions.push(`e.assignedPerson ILIKE $${paramIndex}`);
      params.push(`%${assignedPerson}%`);
      paramIndex++;
    }

    // Outcome tag filtering (US8: retrospective filter)
    if (outcomeTag) {
      conditions.push(`e.outcomeTag = $${paramIndex}`);
      params.push(outcomeTag);
      paramIndex++;
    }

    // Add WHERE clause if we have conditions
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    switch (sortBy) {
      case 'urgency':
        // Sort by how soon the event is (date closest to today first)
        sql += ' ORDER BY ABS(EXTRACT(EPOCH FROM (e.date - CURRENT_DATE))) ASC';
        break;
      case 'priority':
        // Sort by priority (High -> Medium -> Low)
        sql += ` ORDER BY
          CASE e.priority
            WHEN 'High' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'Low' THEN 3
          END ASC, e.date ASC`;
        break;
      case 'date':
      default:
        sql += ' ORDER BY e.date ASC';
        break;
    }

    const result = await query(sql, params);

    return result.rows.map(this.mapRowToEventWithDetails);
  }

  /**
   * Get the timeline status for an event
   * Used for validating retrospective field edits
   */
  async getEventTimelineStatus(eventId: string): Promise<TimelineStatus | null> {
    const result = await query(
      `SELECT t.status FROM events e
       JOIN timelines t ON e.timelineId = t.id
       WHERE e.id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].status as TimelineStatus;
  }

  /**
   * Check if retrospective fields can be edited (only on Completed/Archived timelines)
   */
  private canEditRetroFields(timelineStatus: TimelineStatus): boolean {
    return timelineStatus === 'Completed' || timelineStatus === 'Archived';
  }

  /**
   * Update an event
   * @param id - Event ID
   * @param data - Update data
   * @param timelineStatus - Optional timeline status for retro field validation
   */
  async updateEvent(
    id: string,
    data: UpdateEventDto,
    timelineStatus?: TimelineStatus
  ): Promise<Event | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Validate retrospective fields if provided
    const hasRetroFields = data.retroNotes !== undefined || data.outcomeTag !== undefined;
    if (hasRetroFields) {
      // Get timeline status if not provided
      const status = timelineStatus || await this.getEventTimelineStatus(id);
      if (!status) {
        throw new Error('Event or timeline not found');
      }
      if (!this.canEditRetroFields(status)) {
        throw new Error(
          'Retrospective notes and outcome tags can only be edited on Completed or Archived timelines'
        );
      }
    }

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(data.date);
    }
    if (data.time !== undefined) {
      fields.push(`time = $${paramCount++}`);
      values.push(data.time);
    }
    if (data.endTime !== undefined) {
      fields.push(`endTime = $${paramCount++}`);
      values.push(data.endTime);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.categoryId !== undefined) {
      fields.push(`categoryId = $${paramCount++}`);
      values.push(data.categoryId);
    }
    if (data.assignedPerson !== undefined) {
      fields.push(`assignedPerson = $${paramCount++}`);
      values.push(data.assignedPerson);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(data.priority);
    }
    // Retrospective fields (US8)
    if (data.retroNotes !== undefined) {
      fields.push(`retroNotes = $${paramCount++}`);
      values.push(data.retroNotes);
    }
    if (data.outcomeTag !== undefined) {
      fields.push(`outcomeTag = $${paramCount++}`);
      values.push(data.outcomeTag); // Can be null to clear
    }

    if (fields.length === 0) {
      return this.getEventById(id);
    }

    fields.push(`updatedAt = NOW()`);
    values.push(id);

    const sql = `
      UPDATE events
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEvent(result.rows[0]);
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<boolean> {
    const result = await query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  /**
   * Map database row to Event object
   */
  private mapRowToEvent(row: any): Event {
    return {
      id: row.id,
      title: row.title,
      date: new Date(row.date),
      time: row.time, // HH:MM string from database
      endTime: row.endtime, // HH:MM string from database
      description: row.description,
      categoryId: row.categoryid,
      timelineId: row.timelineid,
      assignedPerson: row.assignedperson,
      status: row.status as EventStatus,
      priority: row.priority as EventPriority,
      retroNotes: row.retronotes || undefined,
      outcomeTag: row.outcometag as OutcomeTag | undefined,
      sourceEventId: row.sourceeventid || undefined,
      createdBy: row.createdby,
      createdAt: new Date(row.createdat),
      updatedAt: new Date(row.updatedat),
    };
  }

  /**
   * Map database row to EventWithDetails object
   */
  private mapRowToEventWithDetails(row: any): EventWithDetails {
    return {
      id: row.id,
      title: row.title,
      date: new Date(row.date),
      time: row.time, // HH:MM string from database
      endTime: row.endtime, // HH:MM string from database
      description: row.description,
      categoryId: row.categoryid,
      timelineId: row.timelineid,
      assignedPerson: row.assignedperson,
      status: row.status as EventStatus,
      priority: row.priority as EventPriority,
      retroNotes: row.retronotes || undefined,
      outcomeTag: row.outcometag as OutcomeTag | undefined,
      sourceEventId: row.sourceeventid || undefined,
      createdBy: row.createdby,
      createdAt: new Date(row.createdat),
      updatedAt: new Date(row.updatedat),
      categoryName: row.categoryname,
      categoryColor: row.categorycolor,
      createdByName: row.createdbyname,
    };
  }
}

export default new EventService();
