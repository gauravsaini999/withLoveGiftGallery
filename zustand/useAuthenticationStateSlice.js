import { create } from 'zustand';

export const useAuthenticationStateSlice = create((set, get) => ({
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
