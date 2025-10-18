import { query } from '../db/connection';
import {
  Event,
  EventWithDetails,
  CreateEventDto,
  UpdateEventDto,
  EventStatus,
  EventPriority,
} from '../models/Event';

export class EventService {
  /**
   * Create a new event
   */
  async createEvent(userId: string, data: CreateEventDto): Promise<Event> {
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

    const result = await query(
      `INSERT INTO events (title, date, time, endTime, description, categoryId, assignedPerson, status, priority, createdBy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, date, time, endTime, description, categoryId, assignedPerson, status, priority, userId]
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
   * Get all events with optional filtering and sorting
   */
  async getEvents(
    startDate?: string,
    endDate?: string,
    sortBy?: 'date' | 'urgency' | 'priority',
    status?: EventStatus,
    priority?: EventPriority,
    categoryId?: string,
    assignedPerson?: string
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
   * Update an event
   */
  async updateEvent(id: string, data: UpdateEventDto): Promise<Event | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

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
      assignedPerson: row.assignedperson,
      status: row.status as EventStatus,
      priority: row.priority as EventPriority,
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
      assignedPerson: row.assignedperson,
      status: row.status as EventStatus,
      priority: row.priority as EventPriority,
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
