import { create } from 'zustand';

export const useAuthenticationStateSlice = create((set, get) => ({
    isLoggedIn: false,
    userObj: null,
    loginFn: (userObj) => set((state) => ({
        isLoggedIn: true,
        userObj
    })),
    logoutFn: () => set((state) => ({
        isLoggedIn: false,
        userObj: null
    }))
}));
