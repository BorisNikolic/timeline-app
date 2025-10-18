import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { eventsApi, EventWithDetails, CreateEventDto, UpdateEventDto } from '../services/api-client';

interface EventState {
  events: EventWithDetails[];
  selectedEvent: EventWithDetails | null;
  isLoading: boolean;
  error: string | null;
  setEvents: (events: EventWithDetails[]) => void;
  addEvent: (event: EventWithDetails) => void;
  updateEvent: (id: string, event: EventWithDetails) => void;
  removeEvent: (id: string) => void;
  setSelectedEvent: (event: EventWithDetails | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchEvents: (startDate?: string, endDate?: string) => Promise<void>;
  createEvent: (data: CreateEventDto) => Promise<EventWithDetails>;
  updateEventAsync: (id: string, data: UpdateEventDto) => Promise<EventWithDetails>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventState>()(
  devtools(
    (set) => ({
      events: [],
      selectedEvent: null,
      isLoading: false,
      error: null,
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, event) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? event : e)),
        })),
      removeEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchEvents: async (startDate?: string, endDate?: string) => {
        set({ isLoading: true, error: null });
        try {
          const events = await eventsApi.getAll(startDate, endDate);
          set({ events, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch events',
            isLoading: false
          });
        }
      },

      createEvent: async (data: CreateEventDto) => {
        set({ isLoading: true, error: null });
        try {
          const newEvent = await eventsApi.create(data);
          set((state) => ({
            events: [...state.events, newEvent],
            isLoading: false
          }));
          return newEvent;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create event',
            isLoading: false
          });
          throw error;
        }
      },

      updateEventAsync: async (id: string, data: UpdateEventDto) => {
        set({ isLoading: true, error: null });
        try {
          const updatedEvent = await eventsApi.update(id, data);
          set((state) => ({
            events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
            isLoading: false
          }));
          return updatedEvent;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update event',
            isLoading: false
          });
          throw error;
        }
      },

      deleteEvent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await eventsApi.delete(id);
          set((state) => ({
            events: state.events.filter((e) => e.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete event',
            isLoading: false
          });
          throw error;
        }
      },
    }),
    { name: 'EventStore' }
  )
);
