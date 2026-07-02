import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if email is in the allowed whitelist
 * Reads ALLOWED_EMAILS environment variable (comma-separated list)
 *
 * Usage: Add this middleware to registration routes to restrict who can sign up
 *
 * If ALLOWED_EMAILS is not set or empty, all emails are allowed (development mode)
 */
export const checkEmailWhitelist = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;

  // Get allowed emails from environment variable
  const allowedEmailsEnv = process.env.ALLOWED_EMAILS;

  // If no whitelist configured: fail CLOSED in production (deny), open in dev.
  if (!allowedEmailsEnv || allowedEmailsEnv.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'ALLOWED_EMAILS is not set in production - refusing all registrations. ' +
        'Set ALLOWED_EMAILS to enable registration.'
      );
      res.status(403).json({
        error: 'Registration not allowed',
        message: 'Registration is currently closed.',
      });
      return;
    }
    console.warn(
      'ALLOWED_EMAILS not configured - allowing all registrations (development only).'
    );
    return next();
  }

  // Parse comma-separated list and normalize (lowercase, trim)
  const allowedEmails = allowedEmailsEnv
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0);

  // Check if the provided email is in the whitelist
  const normalizedEmail = email.toLowerCase().trim();

  if (!allowedEmails.includes(normalizedEmail)) {
    res.status(403).json({
      error: 'Registration not allowed',
      message: 'Your email address is not authorized to register. Please contact the administrator for access.',
    });
    return;
  }

  // Email is whitelisted, proceed
  next();
};
