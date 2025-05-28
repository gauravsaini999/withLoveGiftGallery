import { create } from 'zustand';

export const useNavigationHistory = create((set) => ({
  history: [],
  activeRoute: 'Home',
  profilePress: false,
  push: (screen) =>
    set((state) => {
      let wordSplit = screen.split(' ');
      let length = wordSplit.length;
      if(length == 2) {
        if(wordSplit[0] == 'Home') {
          screen = 'Home';
        }
      }
      const last = state.history[state.history.length - 1];
      if (last === screen) return state;
      const newHistory = [...state.history, screen];
      return { history: newHistory };
    }),
  pop: () => set((state) => ({
    history: state.history.slice(0, -1),
  })),
  reset: () => set({ history: [] }),
  setActiveRoute: (screen) => set((state) => {
    return { ...state, activeRoute: screen }
  }),
  setProfilePress: (bool) => set((state) => ({
    ...state,
    profilePress: bool
  }))
}));