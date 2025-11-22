import { Router } from 'express';
import authRoutes from './auth';
import eventRoutes from './events';
import categoryRoutes from './categories';
import exportRoutes from './export';
import timelineRoutes from './timelines';
import memberRoutes from './members';
import userRoutes from './users';
import dashboardRoutes from './dashboard';
import preferencesRoutes from './preferences';

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
      timelines: '/api/timelines',
      users: '/api/users',
      dashboard: '/api/dashboard',
      preferences: '/api/preferences',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/categories', categoryRoutes);
router.use('/export', exportRoutes);
router.use('/timelines', timelineRoutes);
router.use('/timelines/:timelineId/members', memberRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/preferences', preferencesRoutes);

export default router;
