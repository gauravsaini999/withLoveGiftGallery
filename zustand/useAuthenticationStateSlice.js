import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthenticationStateSlice = create((set, get) => ({
    isLoggedIn: false,
    phoneAuth: 'not-done',
    userObj: null,
    loginFn: ({ userObj }) => set((state) => {
        console.log(userObj, 'userObj being set in useSlice')
        return {
            isLoggedIn: true,
            userObj,
            ...state
        }
    }),
    logoutFn: () => set((state) => ({
        isLoggedIn: false,
        userObj: null,
        ...state
    })),
    reset: () => set((state) => ({
        isLoggedIn: false,
        userObj: null,
        ...state
    }))
}))
// ,
//     {
//         name: 'auth-storage',
//         storage: createJSONStorage(() => AsyncStorage)
//     }
// ));
