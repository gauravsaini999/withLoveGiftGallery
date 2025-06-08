import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthenticationStateSlice = create((set, get) => ({
    isLoggedIn: false,
    phoneAuth: 'not-done',
    userObj: null,
    loginFn: ({ userObj, phoneAuth }) => set((state) => {
        return {
            isLoggedIn: true,
            userObj,
            phoneAuth
        }
    }),
    logoutFn: () => set((state) => ({
        isLoggedIn: false,
        userObj: null,
        phoneAuth: 'not-done'
    })),
    reset: () => set((state) => ({
        isLoggedIn: false,
        userObj: null,
        phoneAuth: 'not-done'
    }))
}))
// ,
//     {
//         name: 'auth-storage',
//         storage: createJSONStorage(() => AsyncStorage)
//     }
// ));
