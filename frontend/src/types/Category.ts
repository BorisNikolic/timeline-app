/**
 * Category entity types
 */

export interface Category {
  id: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}
