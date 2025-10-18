/**
 * Category entity types
 */

export interface Category {
  id: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt: Date;
}

// DTO for creating categories
export interface CreateCategoryDto {
  name: string;
  color: string;
}

// DTO for updating categories
export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}
