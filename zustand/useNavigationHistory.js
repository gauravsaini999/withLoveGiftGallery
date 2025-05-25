import { create } from 'zustand';

export const useNavigationHistory = create((set) => ({
  history: [],
  backIndex: 0,
  push: (screen) =>
    set((state) => {
      const last = state.history[state.history.length - 1];
      if (last === screen) return state;
      const newHistory = [...state.history, screen];
      return { history: newHistory };
    }),
  pop: () => set((state) => ({
    history: state.history.slice(0, -1),
  })),
  reset: () => set({ history: [] }),
}));