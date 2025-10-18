import { useState } from 'react';
import Timeline from '../components/timeline/Timeline';
import EventModal from '../components/events/EventModal';
import ExportMenu from '../components/export/ExportMenu';

function TimelinePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header with Add Event button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your festival events on the timeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu />
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Add Event
          </button>
        </div>
      </div>

      {/* Timeline Component */}
      <Timeline />

      {/* Event Modal */}
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default TimelinePage;
