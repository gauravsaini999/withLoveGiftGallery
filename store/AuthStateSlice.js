import { create } from 'zustand';

export const useAuth = create((set, get) => ({
    isLoggedIn: false,
    userObj: null,
    loginFn: (userObj) => set((state) => ({
        isLoggedIn: !state.isLoggedIn,
        userObj
    })),
    logoutFn: () => set((state) => ({
        isLoggedIn: !state.isLoggedIn,
        userObj: null
    }))
}));
