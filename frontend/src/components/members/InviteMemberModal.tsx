import React, { useState, useEffect, useRef } from 'react';
import { MemberRole, ROLE_CONFIG } from '../../types/timeline';
import { useUserSearch, useInviteMember } from '../../hooks/useMembers';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  timelineId: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  timelineId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<MemberRole>('Editor');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading: isSearching } = useUserSearch(
    searchQuery,
    timelineId
  );
  const inviteMutation = useInviteMember(timelineId);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedUser(null);
      setSelectedRole('Editor');
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInvite = async () => {
    if (!selectedUser) return;

    try {
      await inviteMutation.mutateAsync({
        userId: selectedUser.id,
        role: selectedRole,
      });
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const handleSelectUser = (user: { id: string; name: string; email: string }) => {
    setSelectedUser(user);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const roles: MemberRole[] = ['Admin', 'Editor', 'Viewer'];

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
            <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
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

          {/* Search or selected user */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search User
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{selectedUser.name}</div>
                    <div className="text-xs text-gray-500">{selectedUser.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search by name or email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Search results dropdown */}
                {isDropdownOpen && searchQuery.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <ul className="py-1">
                        {searchResults.map((user) => (
                          <li key={user.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectUser(user)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        No users found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Role selection */}
          <div className="mb-6">
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
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInvite}
              disabled={!selectedUser || inviteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
