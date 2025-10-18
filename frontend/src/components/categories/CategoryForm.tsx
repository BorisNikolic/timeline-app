import { useState, FormEvent } from 'react';
import { CreateCategoryDto } from '../../services/api-client';

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateCategoryDto>;
}

const DEFAULT_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

function CategoryForm({ onSubmit, onCancel, isLoading = false, initialData }: CategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: initialData?.name || '',
    color: initialData?.color || DEFAULT_COLORS[0],
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="input-field mt-1"
          placeholder="e.g., Setup, Performance, Cleanup"
          maxLength={100}
        />
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color *
        </label>
        <div className="flex flex-wrap gap-3">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
              className={`h-10 w-10 rounded-full border-2 transition-all ${
                formData.color === color
                  ? 'border-gray-900 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="mt-3">
          <label htmlFor="color" className="block text-xs text-gray-500 mb-1">
            Or enter a custom hex color:
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="input-field"
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            maxLength={7}
          />
        </div>
      </div>

      {/* Color Preview */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
        <div
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: formData.color }}
        />
        <span className="text-sm text-gray-600">
          {formData.name || 'Category Name'} - {formData.color}
        </span>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
