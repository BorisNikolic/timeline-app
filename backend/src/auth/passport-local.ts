import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { query } from '../db/connection';
import { comparePassword } from './password';

// Configure local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

        if (result.rows.length === 0) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password
        const isValid = await comparePassword(password, user.passwordhash);

        if (!isValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Return user object (without password hash)
        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdat,
          updatedAt: user.updatedat,
        };

        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
