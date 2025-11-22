import React, { useState, useRef, useEffect } from 'react';
import { MemberRole, ROLE_CONFIG } from '../../types/timeline';

interface RoleDropdownProps {
  currentRole: MemberRole;
  onRoleChange: (role: MemberRole) => void;
  disabled?: boolean;
  isOwner?: boolean;
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({
  currentRole,
  onRoleChange,
  disabled = false,
  isOwner = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles: MemberRole[] = ['Admin', 'Editor', 'Viewer'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: MemberRole) => {
    if (role !== currentRole) {
      onRoleChange(role);
    }
    setIsOpen(false);
  };

  const config = ROLE_CONFIG[currentRole];

  // If disabled or owner, show static badge
  if (disabled || isOwner) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
      >
        {config.label}
        {isOwner && <span className="ml-1 text-gray-500">(Owner)</span>}
      </span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} hover:opacity-80 transition-opacity cursor-pointer`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {config.label}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-32 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <ul className="py-1" role="listbox">
            {roles.map((role) => {
              const roleConfig = ROLE_CONFIG[role];
              return (
                <li key={role}>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      role === currentRole ? 'bg-gray-50' : ''
                    }`}
                    role="option"
                    aria-selected={role === currentRole}
                  >
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}>
                      {roleConfig.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoleDropdown;
