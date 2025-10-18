import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/error-handler';
import CategoryService from '../services/CategoryService';

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be in hex format (#RRGGBB)'),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be in hex format (#RRGGBB)').optional(),
});

/**
 * GET /api/categories
 * Get all categories
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories();
    res.json(categories);
  })
);

/**
 * GET /api/categories/:id
 * Get category by ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  })
);

/**
 * POST /api/categories
 * Create a new category
 */
router.post(
  '/',
  authenticate,
  validate(createCategorySchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const category = await CategoryService.createCategory(req.user!.userId, req.body);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof Error && error.message === 'Category with this name already exists') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * PUT /api/categories/:id
 * Update a category
 */
router.put(
  '/:id',
  authenticate,
  validate(updateCategorySchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      if (error instanceof Error && error.message === 'Category with this name already exists') {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
);

/**
 * DELETE /api/categories/:id
 * Delete a category and cascade delete all its events
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = await CategoryService.deleteCategory(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  })
);

export default router;
