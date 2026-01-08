import React from 'react';
import InviteByEmailForm from './InviteByEmailForm';

interface InviteByEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  timelineId: string;
}

const InviteByEmailModal: React.FC<InviteByEmailModalProps> = ({
  isOpen,
  onClose,
  timelineId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invite via Email</h2>
              <p className="text-sm text-gray-500 mt-1">
                Send an invitation link to any email address
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <InviteByEmailForm
            timelineId={timelineId}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default InviteByEmailModal;
