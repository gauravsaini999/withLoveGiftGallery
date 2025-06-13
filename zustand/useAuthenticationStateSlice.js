import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthenticationStateSlice = create((set, get) => ({
    isLoggedIn: false,
    phoneAuth: false,
    userObj: null,
    loginFn: ({ userObj }) => set((state) => {
        return {
            ...state,
            isLoggedIn: true,
            userObj,
        }
    }),
    logoutFn: () => set((state) => {
        return {
            ...state,
            isLoggedIn: false,
            userObj: null,
        }
    }),
    reset: () => set((state) => {
        return {
            ...state,
            isLoggedIn: false,
            userObj: null,
        }
    }),
    setPhoneAuth: (bool) => set((state) => {
        return {
            ...state,
            phoneAuth: bool
        }
    })
}))
// ,
//     {
//         name: 'auth-storage',
//         storage: createJSONStorage(() => AsyncStorage)
//     }
// ));
