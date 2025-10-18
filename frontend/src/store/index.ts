import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Main store combining all slices
export interface Store {
  // Store state will be defined as features are added
}

export const useStore = create<Store>()(
  devtools(
    () => ({
      // Initial state
    }),
    { name: 'FestivalTimelineStore' }
  )
);
