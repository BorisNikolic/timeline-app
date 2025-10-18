import { Router } from 'express';
import authRoutes from './auth';
import eventRoutes from './events';
import categoryRoutes from './categories';
import exportRoutes from './export';

const router = Router();

// API version info
router.get('/', (_req, res) => {
  res.json({
    name: 'Festival Timeline API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      categories: '/api/categories',
      export: '/api/export',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/categories', categoryRoutes);
router.use('/export', exportRoutes);

export default router;
