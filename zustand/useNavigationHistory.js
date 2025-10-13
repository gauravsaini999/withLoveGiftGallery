import { create } from 'zustand';

const getNavigationPath = (state, path = []) => {
  if (!state) return path;

  const { routes, index, type, key } = state;
  const activeRoute = routes?.[index];

  if (!activeRoute) return path;

  const navigatorName = key?.split('-')[0]; // get navigator name from key (e.g., "Stack")
  const screenName = activeRoute.name;

  path.push({
    navigator: navigatorName,
    screen: screenName,
  });

  // Recurse into nested navigator if any
  if (activeRoute.state) {
    return getNavigationPath(activeRoute.state, path);
  }

  return path;
};

const traverseNavTree = (state, parentNavigator = null) => {
  const result = [];

  if (!state?.routes) return result;

  for (const route of state.routes) {
    const navigatorType = state?.type || 'unknown';
    const screen = route.name;

    result.push({
      navigator: parentNavigator || navigatorType,
      screen,
    });

    // If the route itself is a navigator, recurse into it
    if (route.state) {
      const nested = traverseNavTree(route.state, navigatorType);
      result.push(...nested);
    }
  }

  return result;
};

export const useNavigationHistory = create((set) => ({
  history: [],
  activeRoute: 'Home',
  initPaths: [],
  insertInitPaths: (navigationState) => set((state) => {
    const path = traverseNavTree(navigationState);
    return {
      ...state, initPaths: path
    }
  }),
  push: (screen) =>
    set((state) => {
      let wordSplit = screen.split(' ');
      let length = wordSplit.length;
      if (length == 2) {
        if (wordSplit[0] == 'Home') {
          screen = 'Home';
        }
        else if (wordSplit[0] = 'Edit') {
          screen = 'Edit Profile';
        }
      }
      const last = state.history[state.history.length - 1];
      if (last === screen) return state;
      const newHistory = [...state.history, screen];
      return { ...state, history: newHistory };
    }),
  pop: () => set((state) => ({
      ...state,
      history: state.history.slice(0, -1)
  })),
  reset: () => set({ history: [] }),
  setActiveRoute: (screen) => set((state) => {
    return { ...state, activeRoute: screen }
  })
}));