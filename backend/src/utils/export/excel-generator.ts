import ExcelJS from 'exceljs';
import { EventWithDetails } from '../../models/Event';

export async function generateExcel(events: EventWithDetails[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Group events by month
  const eventsByMonth = new Map<string, EventWithDetails[]>();

  events.forEach((event) => {
    const date = new Date(event.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!eventsByMonth.has(monthKey)) {
      eventsByMonth.set(monthKey, []);
    }
    eventsByMonth.get(monthKey)!.push(event);
  });

  // Sort months chronologically
  const sortedMonths = Array.from(eventsByMonth.keys()).sort();

  // If no events, create a single empty sheet
  if (sortedMonths.length === 0) {
    const worksheet = workbook.addWorksheet('No Events');
    worksheet.getCell('A1').value = 'No events found';
    worksheet.getCell('A1').font = { bold: true, size: 14 };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // Create a tab for each month
  sortedMonths.forEach((monthKey) => {
    const monthEvents = eventsByMonth.get(monthKey)!;
    const date = new Date(monthEvents[0].date);
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    // Create worksheet with sanitized name (Excel has 31 char limit)
    const sheetName = monthName.substring(0, 31);
    const worksheet = workbook.addWorksheet(sheetName);

    // Add title row
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Festival Events - ${monthName}`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // Add summary row
    worksheet.mergeCells('A2:J2');
    const summaryCell = worksheet.getCell('A2');
    summaryCell.value = `Total Events: ${monthEvents.length}`;
    summaryCell.font = { italic: true, size: 11 };
    summaryCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    // Set column widths (without headers, to avoid auto-insertion at row 1)
    worksheet.columns = [
      { key: 'title', width: 30 },
      { key: 'date', width: 12 },
      { key: 'description', width: 40 },
      { key: 'categoryName', width: 18 },
      { key: 'status', width: 15 },
      { key: 'priority', width: 12 },
      { key: 'assignedPerson', width: 22 },
      { key: 'createdByName', width: 22 },
      { key: 'createdAt', width: 18 },
      { key: 'updatedAt', width: 18 },
    ];

    // Manually set headers in row 4
    const headerRow = worksheet.getRow(4);
    headerRow.values = [
      'Title',
      'Date',
      'Description',
      'Category',
      'Status',
      'Priority',
      'Assigned Person',
      'Created By',
      'Created At',
      'Updated At'
    ];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' },
    };
    headerRow.height = 25;
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add borders to header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' },
      };
    });

    // Sort events by date within the month
    monthEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Add data rows (starting at row 5)
    let rowNumber = 5;
    monthEvents.forEach((event) => {
      const row = worksheet.addRow({
        title: event.title,
        date: new Date(event.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        description: event.description || '',
        categoryName: event.categoryName,
        status: event.status,
        priority: event.priority,
        assignedPerson: event.assignedPerson || '',
        createdByName: event.createdByName,
        createdAt: new Date(event.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        updatedAt: new Date(event.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      });

      // Alternate row colors for better readability
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Color code status
      const statusCell = row.getCell(5);
      if (event.status === 'Completed') {
        statusCell.font = { bold: true, color: { argb: 'FF008000' } };
      } else if (event.status === 'In Progress') {
        statusCell.font = { bold: true, color: { argb: 'FFFF8C00' } };
      } else {
        statusCell.font = { color: { argb: 'FF808080' } };
      }

      // Color code priority
      const priorityCell = row.getCell(6);
      if (event.priority === 'High') {
        priorityCell.font = { bold: true, color: { argb: 'FFDC143C' } };
      } else if (event.priority === 'Medium') {
        priorityCell.font = { color: { argb: 'FFFF8C00' } };
      } else {
        priorityCell.font = { color: { argb: 'FF808080' } };
      }

      rowNumber++;
    });

    // Freeze header rows
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 4 }
    ];

    // Auto-filter on headers
    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: 10 },
    };
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
