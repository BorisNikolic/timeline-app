import { query } from '../db/connection';
import { hashPassword, comparePassword } from '../auth/password';
import { generateToken } from '../auth/jwt';
import { User, CreateUserDto, LoginDto, AuthResponse } from '../models/User';

export class UserService {
  /**
   * Register a new user
   */
  async register(data: CreateUserDto): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, passwordHash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, createdAt, updatedAt`,
      [email, passwordHash, name]
    );

    const user = this.mapRowToUser(result.rows[0]);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  }

  /**
   * Login user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const userRow = result.rows[0];

    // Verify password
    const isValidPassword = await comparePassword(password, userRow.passwordhash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const user = this.mapRowToUser(userRow);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, name, createdAt, updatedAt FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, name, createdAt, updatedAt FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Search users for invite autocomplete
   * Returns users matching email or name, optionally excluding users already in a timeline
   */
  async search(
    searchTerm: string,
    excludeTimelineId?: string,
    limit: number = 10
  ): Promise<Array<{ id: string; name: string; email: string }>> {
    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    let sql: string;
    let params: any[];

    if (excludeTimelineId) {
      // Exclude users who are already members of the timeline
      sql = `
        SELECT u.id, u.name, u.email
        FROM users u
        WHERE (LOWER(u.email) LIKE $1 OR LOWER(u.name) LIKE $1)
          AND u.id NOT IN (
            SELECT tm.userId FROM timeline_members tm WHERE tm.timelineId = $2
          )
        ORDER BY u.name ASC
        LIMIT $3
      `;
      params = [searchPattern, excludeTimelineId, limit];
    } else {
      sql = `
        SELECT id, name, email
        FROM users
        WHERE LOWER(email) LIKE $1 OR LOWER(name) LIKE $1
        ORDER BY name ASC
        LIMIT $2
      `;
      params = [searchPattern, limit];
    }

    const result = await query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
    }));
  }

  /**
   * Map database row to User object
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.createdat),
      updatedAt: new Date(row.updatedat),
    };
  }
}

export default new UserService();
