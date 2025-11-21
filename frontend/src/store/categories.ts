import { create } from 'zustand';
import { categoriesApi, Category, CreateCategoryDto, UpdateCategoryDto } from '../services/api-client';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, _get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.getAll();
      set({ categories, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        isLoading: false
      });
    }
  },

  createCategory: async (data: CreateCategoryDto) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoriesApi.create(data);
      set(state => ({
        categories: [...state.categories, newCategory],
        isLoading: false
      }));
      return newCategory;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create category',
        isLoading: false
      });
      throw error;
    }
  },

  updateCategory: async (id: string, data: UpdateCategoryDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await categoriesApi.update(id, data);
      set(state => ({
        categories: state.categories.map(cat =>
          cat.id === id ? updatedCategory : cat
        ),
        isLoading: false
      }));
      return updatedCategory;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update category',
        isLoading: false
      });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesApi.delete(id);
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete category',
        isLoading: false
      });
      throw error;
    }
  },
}));
