// useScreenTracking.ts
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigationHistory } from '../zustand/useNavigationHistory';
import { useCallback } from 'react';

export function useScreenTracking() {
  const route = useRoute();
  const { push } = useNavigationHistory();

  useFocusEffect(
    useCallback(() => {
      push(route.name);
    }, [route.name])
  );
}
