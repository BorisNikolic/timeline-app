import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useCategoryStore } from '../store/categories';
import { categoriesApi, handleApiError, CreateCategoryDto, UpdateCategoryDto } from '../services/api-client';

// Query key factory for categories (T107)
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (timelineId?: string) => [...categoryKeys.lists(), { timelineId }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

/**
 * Legacy hook using Zustand store (for backward compatibility)
 */
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

/**
 * Fetch categories by timeline ID using React Query (T107)
 */
export function useTimelineCategories(timelineId: string | null | undefined) {
  return useQuery({
    queryKey: categoryKeys.list(timelineId || undefined),
    queryFn: () => categoriesApi.getByTimeline(timelineId!),
    enabled: !!timelineId,
  });
}

/**
 * Create category in a specific timeline (T107)
 */
export function useCreateTimelineCategory(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.createInTimeline(timelineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

/**
 * Update category in a specific timeline (T107)
 */
export function useUpdateTimelineCategory(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryDto }) =>
      categoriesApi.updateInTimeline(timelineId, categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

/**
 * Delete category from a specific timeline (T107)
 */
export function useDeleteTimelineCategory(timelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesApi.deleteFromTimeline(timelineId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}
