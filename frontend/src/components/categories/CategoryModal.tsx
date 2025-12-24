import { Fragment, useEffect } from 'react';
import CategoryForm from './CategoryForm';
import { Category } from '../../types/Category';
import { useCreateTimelineCategory, useUpdateTimelineCategory } from '../../hooks/useCategories';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category; // If provided, we're in edit mode
  timelineId: string;
}

function CategoryModal({ isOpen, onClose, category, timelineId }: CategoryModalProps) {
  const createCategory = useCreateTimelineCategory(timelineId);
  const updateCategory = useUpdateTimelineCategory(timelineId);
  const isEditMode = !!category;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (data: { name: string; color: string }) => {
    try {
      if (isEditMode) {
        // Edit mode - update existing category
        await updateCategory.mutateAsync({ categoryId: category.id, data });
      } else {
        // Create mode - create new category
        await createCategory.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to save category:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Category' : 'Create New Category'}
          </h2>
          <CategoryForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            initialData={isEditMode ? {
              name: category.name,
              color: category.color,
            } : undefined}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default CategoryModal;
