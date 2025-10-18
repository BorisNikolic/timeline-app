import { parse } from 'json2csv';
import { EventWithDetails } from '../../models/Event';

export function generateCSV(events: EventWithDetails[]): string {
  const fields = [
    { label: 'Title', value: 'title' },
    { label: 'Date', value: 'date' },
    { label: 'Description', value: 'description' },
    { label: 'Category', value: 'categoryName' },
    { label: 'Status', value: 'status' },
    { label: 'Priority', value: 'priority' },
    { label: 'Assigned Person', value: 'assignedPerson' },
    { label: 'Created By', value: 'createdByName' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ];

  const csv = parse(events, { fields });
  return csv;
}
