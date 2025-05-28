import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthenticationStateSlice = create((set, get) => ({
    isLoggedIn: false,
    userObj: null,
    loginFn: (userObj) => set((state) => {
        return {
            isLoggedIn: true,
            userObj
        }
    }),
    logoutFn: () => set((state) => ({
        isLoggedIn: false,
        userObj: null
    }))
}))
// ,
//     {
//         name: 'auth-storage',
//         storage: createJSONStorage(() => AsyncStorage)
//     }
// ));
