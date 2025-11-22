import { query } from '../db/connection';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/Category';

export class CategoryService {
  /**
   * Get all categories (legacy - returns all categories)
   */
  async getAllCategories(): Promise<Category[]> {
    const result = await query(
      `SELECT c.*, u.name as createdByName
       FROM categories c
       JOIN users u ON c.createdBy = u.id
       ORDER BY c.name ASC`
    );

    return result.rows.map(this.mapRowToCategory);
  }

  /**
   * Get categories by timeline ID (T100)
   */
  async getByTimeline(timelineId: string): Promise<Category[]> {
    const result = await query(
      `SELECT c.*, u.name as createdByName
       FROM categories c
       JOIN users u ON c.createdBy = u.id
       WHERE c.timelineId = $1
       ORDER BY c.name ASC`,
      [timelineId]
    );

    return result.rows.map(this.mapRowToCategory);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToCategory(result.rows[0]);
  }

  /**
   * Create a new category
   * @param userId - User creating the category
   * @param data - Category data
   * @param timelineId - Optional timeline ID (for timeline-scoped creation)
   */
  async createCategory(userId: string, data: CreateCategoryDto, timelineId?: string): Promise<Category> {
    const { name, color } = data;

    // Check if category with this name already exists in the same timeline
    const existingQuery = timelineId
      ? 'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND timelineId = $2'
      : 'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)';
    const existingParams = timelineId ? [name, timelineId] : [name];

    const existing = await query(existingQuery, existingParams);

    if (existing.rows.length > 0) {
      throw new Error('Category with this name already exists');
    }

    // For timeline-scoped creation, include timelineId
    if (timelineId) {
      const result = await query(
        `INSERT INTO categories (name, color, createdBy, timelineId)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, color, userId, timelineId]
      );
      return this.mapRowToCategory(result.rows[0]);
    }

    // Legacy creation (backward compatibility)
    const result = await query(
      `INSERT INTO categories (name, color, createdBy)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, color, userId]
    );

    return this.mapRowToCategory(result.rows[0]);
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      // Get the timelineId for the category being updated
      const categoryResult = await query(
        'SELECT timelineId FROM categories WHERE id = $1',
        [id]
      );
      if (categoryResult.rows.length === 0) {
        return null;
      }
      const timelineId = categoryResult.rows[0].timelineid;

      // Check if another category with this name exists in the same timeline
      const existing = await query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2 AND timelineId = $3',
        [data.name, id, timelineId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Category with this name already exists');
      }

      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (data.color !== undefined) {
      fields.push(`color = $${paramCount++}`);
      values.push(data.color);
    }

    if (fields.length === 0) {
      return this.getCategoryById(id);
    }

    values.push(id);

    const sql = `
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToCategory(result.rows[0]);
  }

  /**
   * Delete a category and cascade delete all events in that category
   */
  async deleteCategory(id: string): Promise<boolean> {
    // Delete all events in this category first (cascade delete)
    await query('DELETE FROM events WHERE categoryId = $1', [id]);

    // Then delete the category
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  /**
   * Map database row to Category object
   */
  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      timelineId: row.timelineid,
      createdBy: row.createdby,
      createdAt: new Date(row.createdat),
    };
  }
}

export default new CategoryService();
