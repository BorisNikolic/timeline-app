import { query } from '../db/connection';
import {
  TimelineStatus,
  MemberRole,
} from '../types/timeline';

export interface TimelineCard {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  themeColor: string;
  status: TimelineStatus;
  userRole: MemberRole;
  memberCount: number;
  eventCount: number;
  eventsByStatus: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  completionPercentage: number;
  updatedAt: string;
}

export interface DashboardResponse {
  timelines: TimelineCard[];
  grouped: {
    active: TimelineCard[];
    planning: TimelineCard[];
    completed: TimelineCard[];
  };
  archivedCount: number;
}

export interface DashboardStats {
  totalTimelines: number;
  activeTimelines: number;
  totalEvents: number;
  completedEvents: number;
  overallCompletion: number;
  timelinesAsAdmin: number;
  timelinesAsEditor: number;
  timelinesAsViewer: number;
}

export interface DashboardFilters {
  status?: TimelineStatus;
  year?: number;
  role?: MemberRole;
  sortBy?: 'startDate' | 'name' | 'updatedAt' | 'completion';
  sortOrder?: 'asc' | 'desc';
}

export class DashboardService {
  /**
   * Get dashboard data with all accessible timelines and stats
   */
  async getDashboard(userId: string, filters: DashboardFilters = {}): Promise<DashboardResponse> {
    const { status, year, role, sortBy = 'startDate', sortOrder = 'desc' } = filters;

    // Build WHERE clauses
    const conditions: string[] = ['tm.userId = $1'];
    const params: any[] = [userId];
    let paramCount = 2;

    // Status filter - exclude Archived from main dashboard (will be in separate archive view)
    if (status) {
      conditions.push(`t.status = $${paramCount++}`);
      params.push(status);
    } else {
      // By default, exclude archived from main view
      conditions.push(`t.status != 'Archived'`);
    }

    // Year filter - timelines with dates in this year
    if (year) {
      conditions.push(`(EXTRACT(YEAR FROM t.startDate) = $${paramCount} OR EXTRACT(YEAR FROM t.endDate) = $${paramCount})`);
      params.push(year);
      paramCount++;
    }

    // Role filter
    if (role) {
      conditions.push(`tm.role = $${paramCount++}`);
      params.push(role);
    }

    // Build ORDER BY clause
    let orderBy: string;
    switch (sortBy) {
      case 'name':
        orderBy = `t.name ${sortOrder.toUpperCase()}`;
        break;
      case 'updatedAt':
        orderBy = `t.updatedAt ${sortOrder.toUpperCase()}`;
        break;
      case 'completion':
        orderBy = `completion_pct ${sortOrder.toUpperCase()}`;
        break;
      case 'startDate':
      default:
        orderBy = `t.startDate ${sortOrder.toUpperCase()}`;
        break;
    }

    const sql = `
      SELECT
        t.id,
        t.name,
        t.description,
        t.startDate,
        t.endDate,
        t.themeColor,
        t.status,
        t.updatedAt,
        tm.role as userRole,
        (SELECT COUNT(*) FROM timeline_members WHERE timelineId = t.id) as memberCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id) as eventCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Not Started') as notStartedCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'In Progress') as inProgressCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Completed') as completedCount,
        CASE
          WHEN (SELECT COUNT(*) FROM events WHERE timelineId = t.id) = 0 THEN 0
          ELSE ROUND(
            (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Completed')::numeric /
            (SELECT COUNT(*) FROM events WHERE timelineId = t.id)::numeric * 100,
            1
          )
        END as completion_pct
      FROM timelines t
      JOIN timeline_members tm ON t.id = tm.timelineId
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
    `;

    const result = await query(sql, params);
    const timelines = result.rows.map(row => this.mapToTimelineCard(row));

    // Get archived count for the "View Archive" link
    const archivedResult = await query(
      `SELECT COUNT(*) as count
       FROM timelines t
       JOIN timeline_members tm ON t.id = tm.timelineId
       WHERE tm.userId = $1 AND t.status = 'Archived'`,
      [userId]
    );
    const archivedCount = parseInt(archivedResult.rows[0].count, 10) || 0;

    // Group timelines by status
    const grouped = {
      active: timelines.filter(t => t.status === 'Active'),
      planning: timelines.filter(t => t.status === 'Planning'),
      completed: timelines.filter(t => t.status === 'Completed'),
    };

    return {
      timelines,
      grouped,
      archivedCount,
    };
  }

  /**
   * Get aggregate statistics across all accessible timelines
   */
  async getStats(userId: string): Promise<DashboardStats> {
    const sql = `
      SELECT
        COUNT(DISTINCT t.id) as totalTimelines,
        COUNT(DISTINCT CASE WHEN t.status = 'Active' THEN t.id END) as activeTimelines,
        (
          SELECT COUNT(*)
          FROM events e
          JOIN timelines tl ON e.timelineId = tl.id
          JOIN timeline_members tm2 ON tl.id = tm2.timelineId
          WHERE tm2.userId = $1
        ) as totalEvents,
        (
          SELECT COUNT(*)
          FROM events e
          JOIN timelines tl ON e.timelineId = tl.id
          JOIN timeline_members tm2 ON tl.id = tm2.timelineId
          WHERE tm2.userId = $1 AND e.status = 'Completed'
        ) as completedEvents,
        COUNT(DISTINCT CASE WHEN tm.role = 'Admin' THEN t.id END) as timelinesAsAdmin,
        COUNT(DISTINCT CASE WHEN tm.role = 'Editor' THEN t.id END) as timelinesAsEditor,
        COUNT(DISTINCT CASE WHEN tm.role = 'Viewer' THEN t.id END) as timelinesAsViewer
      FROM timelines t
      JOIN timeline_members tm ON t.id = tm.timelineId
      WHERE tm.userId = $1
    `;

    const result = await query(sql, [userId]);
    const row = result.rows[0];

    const totalEvents = parseInt(row.totalevents, 10) || 0;
    const completedEvents = parseInt(row.completedevents, 10) || 0;

    return {
      totalTimelines: parseInt(row.totaltimelines, 10) || 0,
      activeTimelines: parseInt(row.activetimelines, 10) || 0,
      totalEvents,
      completedEvents,
      overallCompletion: totalEvents > 0
        ? Math.round((completedEvents / totalEvents) * 100 * 10) / 10
        : 0,
      timelinesAsAdmin: parseInt(row.timelinesasadmin, 10) || 0,
      timelinesAsEditor: parseInt(row.timelinesaseditor, 10) || 0,
      timelinesAsViewer: parseInt(row.timelinesasviewer, 10) || 0,
    };
  }

  /**
   * Get archived timelines with pagination (US9: Archive Management)
   */
  async getArchive(
    userId: string,
    options: { page?: number; limit?: number; year?: number; search?: string } = {}
  ): Promise<{ timelines: TimelineCard[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, year, search } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['tm.userId = $1', "t.status = 'Archived'"];
    const params: any[] = [userId];
    let paramCount = 2;

    // Year filter
    if (year) {
      conditions.push(
        `(EXTRACT(YEAR FROM t.startDate) = $${paramCount} OR EXTRACT(YEAR FROM t.endDate) = $${paramCount})`
      );
      params.push(year);
      paramCount++;
    }

    // Search filter - by name or description
    if (search) {
      conditions.push(`(t.name ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    // Count total
    const countSql = `
      SELECT COUNT(DISTINCT t.id) as total
      FROM timelines t
      JOIN timeline_members tm ON t.id = tm.timelineId
      WHERE ${conditions.join(' AND ')}
    `;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10) || 0;

    // Get paginated results
    const sql = `
      SELECT
        t.id,
        t.name,
        t.description,
        t.startDate,
        t.endDate,
        t.themeColor,
        t.status,
        t.updatedAt,
        tm.role as userRole,
        (SELECT COUNT(*) FROM timeline_members WHERE timelineId = t.id) as memberCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id) as eventCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Not Started') as notStartedCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'In Progress') as inProgressCount,
        (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Completed') as completedCount,
        CASE
          WHEN (SELECT COUNT(*) FROM events WHERE timelineId = t.id) = 0 THEN 0
          ELSE ROUND(
            (SELECT COUNT(*) FROM events WHERE timelineId = t.id AND status = 'Completed')::numeric /
            (SELECT COUNT(*) FROM events WHERE timelineId = t.id)::numeric * 100,
            1
          )
        END as completion_pct
      FROM timelines t
      JOIN timeline_members tm ON t.id = tm.timelineId
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.endDate DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    const timelines = result.rows.map(row => this.mapToTimelineCard(row));

    return {
      timelines,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Map database row to TimelineCard
   */
  private mapToTimelineCard(row: any): TimelineCard {
    const eventCount = parseInt(row.eventcount, 10) || 0;
    const completedCount = parseInt(row.completedcount, 10) || 0;

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
      userRole: row.userrole as MemberRole,
      memberCount: parseInt(row.membercount, 10) || 0,
      eventCount,
      eventsByStatus: {
        notStarted: parseInt(row.notstartedcount, 10) || 0,
        inProgress: parseInt(row.inprogresscount, 10) || 0,
        completed: completedCount,
      },
      completionPercentage: parseFloat(row.completion_pct) || 0,
      updatedAt: row.updatedat instanceof Date
        ? row.updatedat.toISOString()
        : row.updatedat,
    };
  }
}

export default new DashboardService();
