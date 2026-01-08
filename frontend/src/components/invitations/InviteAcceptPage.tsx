import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  useValidateInvitation,
  useAcceptInvitationNewUser,
  useAcceptInvitationExistingUser,
} from '../../hooks/useInvitations';
import { ROLE_CONFIG } from '../../types/timeline';

const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Form state for new user registration
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Query and mutations
  const { data: validation, isLoading: isValidating, error: validationError } = useValidateInvitation(token);
  const acceptNewUser = useAcceptInvitationNewUser();
  const acceptExistingUser = useAcceptInvitationExistingUser();

  // Redirect after successful acceptance
  useEffect(() => {
    if (acceptNewUser.isSuccess && acceptNewUser.data) {
      // Auto-login for new users
      login(acceptNewUser.data.token!, acceptNewUser.data.user);
      navigate(`/timeline/${acceptNewUser.data.timeline.id}`);
    }
    if (acceptExistingUser.isSuccess && acceptExistingUser.data) {
      navigate(`/timeline/${acceptExistingUser.data.timeline.id}`);
    }
  }, [acceptNewUser.isSuccess, acceptExistingUser.isSuccess, acceptNewUser.data, acceptExistingUser.data, login, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    try {
      await acceptNewUser.mutateAsync({
        token,
        data: { name: name.trim(), password },
      });
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleExistingUserAccept = async () => {
    if (!token) return;

    try {
      await acceptExistingUser.mutateAsync(token);
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired invitation
  if (!validation?.valid || validationError) {
    const isExpired = validation?.expired;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {isExpired ? 'Invitation Expired' : 'Invalid Invitation'}
            </h2>
            <p className="mt-2 text-gray-600">
              {isExpired
                ? 'This invitation has expired. Please ask the timeline admin to send you a new invitation.'
                : 'This invitation link is invalid or has already been used.'}
            </p>
            <div className="mt-6">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Existing user - wrong account logged in
  if (validation.isExistingUser && user && user.email.toLowerCase() !== validation.email?.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 text-center">
              Wrong Account
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              This invitation was sent to <strong>{validation.email}</strong>, but you're logged in as <strong>{user.email}</strong>.
            </p>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Please log out and sign in with the correct account to accept this invitation.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Existing user - correct account logged in
  if (validation.isExistingUser && user) {
    const roleConfig = validation.role ? ROLE_CONFIG[validation.role] : null;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 text-center">
              You're Invited!
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              <strong>{validation.inviterName}</strong> invited you to join
            </p>
            <p className="mt-1 text-lg font-medium text-gray-900 text-center">
              "{validation.timelineName}"
            </p>
            {roleConfig && (
              <p className="mt-2 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}>
                  {roleConfig.label}
                </span>
              </p>
            )}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleExistingUserAccept}
                disabled={acceptExistingUser.isPending}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {acceptExistingUser.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Joining...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Existing user - not logged in
  if (validation.isExistingUser && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 text-center">
              Login Required
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              You already have an account with <strong>{validation.email}</strong>.
              Please log in to accept this invitation.
            </p>
            <div className="mt-6 text-center">
              <Link
                to={`/auth?redirect=/invite/${token}`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New user - registration form
  const roleConfig = validation.role ? ROLE_CONFIG[validation.role] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              You're Invited!
            </h2>
            <p className="mt-2 text-gray-600">
              <strong>{validation.inviterName}</strong> invited you to join
            </p>
            <p className="mt-1 text-lg font-medium text-gray-900">
              "{validation.timelineName}"
            </p>
            {roleConfig && (
              <p className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}>
                  {roleConfig.label}
                </span>
              </p>
            )}
          </div>

          {/* Registration form */}
          <form onSubmit={handleNewUserSubmit} className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={validation.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="Enter your name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={acceptNewUser.isPending}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) {
                    setFormErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                placeholder="Create a password"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={acceptNewUser.isPending}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) {
                    setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Confirm your password"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={acceptNewUser.isPending}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={acceptNewUser.isPending}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {acceptNewUser.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account & Join'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/auth" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
