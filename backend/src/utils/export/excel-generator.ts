import ExcelJS from 'exceljs';
import { EventWithDetails } from '../../models/Event';

export async function generateExcel(events: EventWithDetails[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Events');

  // Define columns
  worksheet.columns = [
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Category', key: 'categoryName', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Assigned Person', key: 'assignedPerson', width: 25 },
    { header: 'Created By', key: 'createdByName', width: 25 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Updated At', key: 'updatedAt', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data
  events.forEach((event) => {
    worksheet.addRow({
      title: event.title,
      date: event.date,
      description: event.description || '',
      categoryName: event.categoryName,
      status: event.status,
      priority: event.priority,
      assignedPerson: event.assignedPerson || '',
      createdByName: event.createdByName,
      createdAt: new Date(event.createdAt).toISOString(),
      updatedAt: new Date(event.updatedAt).toISOString(),
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
