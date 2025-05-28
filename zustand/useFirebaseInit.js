import { create } from 'zustand';
import {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    MEASUREMENT_ID
} from '@env';
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useFirebaseInit = create(persist((set, get) => ({
    firebaseConfig: {
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_AUTH_DOMAIN,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: FIREBASE_STORAGE_BUCKET,
        messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
        appId: FIREBASE_APP_ID,
        measurementId: MEASUREMENT_ID
    },
    app: { blank: true },
    auth: { blank: true },
    setApp: (app) => set((state) => {
        return {
            ...state,
            app
        }
    }),
    setAuth: (auth) => set((state) => {
        return {
            ...state,
            auth
        }
    })
}),
    {
        name: 'firebase-storage',
        storage: createJSONStorage(() => AsyncStorage)
    }
))