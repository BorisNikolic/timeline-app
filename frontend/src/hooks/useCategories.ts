import { useEffect } from 'react';
import { useCategoryStore } from '../store/categories';

export function useCategories() {
  const { categories, isLoading, error, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (categories.length === 0 && !isLoading) {
      fetchCategories();
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}
