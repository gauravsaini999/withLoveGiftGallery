import { create } from 'zustand';

export const useNavigationHistory = create((set) => ({
  history: [],
  push: (screen) =>
    set((state) => {
      const last = state.history[state.history.length - 1];
      if (last === screen) return state;
      const newHistory = [...state.history, screen];
      const trimmedHistory = newHistory.slice(-2); // only keep last 2
      return { history: trimmedHistory };
    }),
  reset: () => set({ history: [] }),
}));