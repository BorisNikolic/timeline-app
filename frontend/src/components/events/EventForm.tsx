import { useState, FormEvent } from 'react';
import { EventStatus, EventPriority, CreateEventDto } from '../../types/Event';
import { useCategories } from '../../hooks/useCategories';

interface EventFormProps {
  onSubmit: (data: CreateEventDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateEventDto>;
}

function EventForm({ onSubmit, onCancel, isLoading = false, initialData }: EventFormProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState<CreateEventDto>({
    title: initialData?.title || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || '',
    endTime: initialData?.endTime || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    assignedPerson: initialData?.assignedPerson || '',
    status: initialData?.status || EventStatus.NotStarted,
    priority: initialData?.priority || EventPriority.Medium,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Clean up empty optional fields - send undefined instead of empty strings
    const cleanedData: CreateEventDto = {
      ...formData,
      time: formData.time || undefined,
      endTime: formData.endTime || undefined,
      description: formData.description || undefined,
      assignedPerson: formData.assignedPerson || undefined,
    };

    onSubmit(cleanedData);
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
