import { useState, useEffect, FormEvent } from 'react';
import { EventStatus, EventPriority, CreateEventDto, OutcomeTag } from '../../types/Event';
import { TimelineStatus } from '../../types/timeline';
import { useCategories } from '../../hooks/useCategories';
import QuickDatePresets from './QuickDatePresets';
import RetroNotesField from './RetroNotesField';
import OutcomeTagSelector from './OutcomeTagSelector';

interface EventFormProps {
  onSubmit: (data: CreateEventDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateEventDto & { retroNotes?: string; outcomeTag?: OutcomeTag }>;
  timelineStatus?: TimelineStatus; // Show retro fields when Completed or Archived
  mode?: 'create' | 'edit';
  onRetroUpdate?: (data: { retroNotes?: string; outcomeTag?: OutcomeTag | null }) => void;
}

function EventForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
  timelineStatus,
  mode = 'create',
  onRetroUpdate,
}: EventFormProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Determine if retrospective fields should be shown (only on Completed/Archived timelines in edit mode)
  const showRetroFields = mode === 'edit' && (timelineStatus === 'Completed' || timelineStatus === 'Archived');

  const [formData, setFormData] = useState<CreateEventDto & { retroNotes?: string; outcomeTag?: OutcomeTag | null }>({
    title: initialData?.title || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || '',
    endTime: initialData?.endTime || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    assignedPerson: initialData?.assignedPerson || '',
    status: initialData?.status || EventStatus.NotStarted,
    priority: initialData?.priority || EventPriority.Medium,
    retroNotes: initialData?.retroNotes || '',
    outcomeTag: initialData?.outcomeTag || null,
  });

  // Sync form data when initialData changes (e.g., when opening duplicate modal)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        time: initialData.time || '',
        endTime: initialData.endTime || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId || '',
        assignedPerson: initialData.assignedPerson || '',
        status: initialData.status || EventStatus.NotStarted,
        priority: initialData.priority || EventPriority.Medium,
        retroNotes: initialData.retroNotes || '',
        outcomeTag: initialData.outcomeTag || null,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Clean up empty optional fields - send undefined instead of empty strings
    const cleanedData: CreateEventDto & { retroNotes?: string; outcomeTag?: OutcomeTag | null } = {
      title: formData.title,
      date: formData.date,
      categoryId: formData.categoryId,
      status: formData.status,
      priority: formData.priority,
      time: formData.time || undefined,
      endTime: formData.endTime || undefined,
      description: formData.description || undefined,
      assignedPerson: formData.assignedPerson || undefined,
    };

    // Include retrospective fields when on Completed/Archived timelines
    if (showRetroFields) {
      cleanedData.retroNotes = formData.retroNotes || undefined;
      cleanedData.outcomeTag = formData.outcomeTag;
    }

    onSubmit(cleanedData);

    // Handle retro fields separately if callback provided
    if (showRetroFields && onRetroUpdate) {
      onRetroUpdate({
        retroNotes: formData.retroNotes || undefined,
        outcomeTag: formData.outcomeTag,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="input-field mt-1"
          placeholder="e.g., Setup main stage"
          maxLength={255}
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          value={formData.date}
          onChange={handleChange}
          className="input-field mt-1"
        />
        <QuickDatePresets
          onDateSelect={(date) => setFormData(prev => ({ ...prev, date }))}
          baseDate={formData.date}
        />
      </div>

      {/* Time */}
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
          Start Time (optional)
        </label>
        <input
          type="time"
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="input-field mt-1"
        />
      </div>

      {/* End Time */}
      <div>
        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
          End Time (optional)
        </label>
        <input
          type="time"
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="input-field mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Duration will be shown as card width in timeline view
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="input-field mt-1"
          placeholder="Add event details..."
          maxLength={10000}
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          value={formData.categoryId}
          onChange={handleChange}
          className="input-field mt-1"
          disabled={categoriesLoading}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assigned Person */}
      <div>
        <label htmlFor="assignedPerson" className="block text-sm font-medium text-gray-700">
          Assigned Person
        </label>
        <input
          type="text"
          id="assignedPerson"
          name="assignedPerson"
          value={formData.assignedPerson}
          onChange={handleChange}
          className="input-field mt-1"
          placeholder="e.g., John Doe"
          maxLength={255}
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="input-field mt-1"
        >
          <option value={EventStatus.NotStarted}>Not Started</option>
          <option value={EventStatus.InProgress}>In Progress</option>
          <option value={EventStatus.Completed}>Completed</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="input-field mt-1"
        >
          <option value={EventPriority.High}>High</option>
          <option value={EventPriority.Medium}>Medium</option>
          <option value={EventPriority.Low}>Low</option>
        </select>
      </div>

      {/* Retrospective Section (US8) - Only shown on Completed/Archived timelines */}
      {showRetroFields && (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Retrospective
          </div>

          <OutcomeTagSelector
            value={formData.outcomeTag}
            onChange={(tag) => setFormData((prev) => ({ ...prev, outcomeTag: tag }))}
            disabled={isLoading}
          />

          <RetroNotesField
            value={formData.retroNotes}
            onChange={(notes) => setFormData((prev) => ({ ...prev, retroNotes: notes }))}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
}

export default EventForm;
