import React, { useState } from 'react';
import { MemberRole, ROLE_CONFIG } from '../../types/timeline';
import { useCreateInvitation } from '../../hooks/useInvitations';

interface InviteByEmailFormProps {
  timelineId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InviteByEmailForm: React.FC<InviteByEmailFormProps> = ({
  timelineId,
  onSuccess,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('Editor');
  const [emailError, setEmailError] = useState<string | null>(null);

  const createInvitation = useCreateInvitation(timelineId);

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    try {
      await createInvitation.mutateAsync({
        email: email.toLowerCase().trim(),
        role: selectedRole,
      });
      setEmail('');
      setSelectedRole('Editor');
      onSuccess?.();
    } catch {
      // Error handled by mutation hook
    }
  };

  const roles: MemberRole[] = ['Admin', 'Editor', 'Viewer'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email input */}
      <div>
        <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) validateEmail(e.target.value);
          }}
          onBlur={() => email && validateEmail(email)}
          placeholder="collaborator@example.com"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            emailError ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={createInvitation.isPending}
        />
        {emailError && (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
      </div>

      {/* Role selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <div className="flex gap-2">
          {roles.map((role) => {
            const config = ROLE_CONFIG[role];
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                disabled={createInvitation.isPending}
                className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                >
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {selectedRole === 'Admin' && 'Full access: can manage timeline settings and members'}
          {selectedRole === 'Editor' && 'Can create, edit, and delete events and categories'}
          {selectedRole === 'Viewer' && 'Read-only access: can view events and export data'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={createInvitation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={createInvitation.isPending || !email}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {createInvitation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Invitation
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InviteByEmailForm;
