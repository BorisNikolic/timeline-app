import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import EventService from '../services/EventService';
import { generateCSV } from '../utils/export/csv-generator';
import { generateExcel } from '../utils/export/excel-generator';

const router = Router();

/**
 * GET /api/export/events-csv
 * Export all events to CSV
 */
router.get(
  '/events-csv',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const events = await EventService.getEvents();
    const csv = generateCSV(events);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
    res.send(csv);
  })
);

/**
 * GET /api/export/events-excel
 * Export all events to Excel
 */
router.get(
  '/events-excel',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const events = await EventService.getEvents();
    const buffer = await generateExcel(events);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=events.xlsx');
    res.send(buffer);
  })
);

export default router;
