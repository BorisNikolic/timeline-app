import { query } from '../db/connection';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/Category';

export class CategoryService {
  /**
   * Get all categories
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
   */
  async createCategory(userId: string, data: CreateCategoryDto): Promise<Category> {
    const { name, color } = data;

    // Check if category with this name already exists
    const existing = await query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
      [name]
    );

    if (existing.rows.length > 0) {
      throw new Error('Category with this name already exists');
    }

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
      // Check if another category with this name exists
      const existing = await query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2',
        [data.name, id]
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
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (error: any) {
      // Foreign key constraint violation
      if (error.code === '23503') {
        throw new Error('Cannot delete category that has events assigned to it');
      }
      throw error;
    }
  }

  /**
   * Map database row to Category object
   */
  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      createdBy: row.createdby,
      createdAt: new Date(row.createdat),
    };
  }
}

export default new CategoryService();
