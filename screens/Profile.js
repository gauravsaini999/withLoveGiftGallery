import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import ProfileIconButton from '../components/ProfileButton';
import * as React from 'react';
import { colors } from '../shared/colors';
import SignUpForm from './login/SignupForm';
import IOSBackButton from '../components/CustomBackButton';
import { useScreenTracking } from '../shared/useScreenTracking';
import { useNavigationHistory } from '../zustand/useNavigationHistory';

export default function ProfileScreen() {
  useScreenTracking();
  
  const { history } = useNavigationHistory();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => <ProfileIconButton changeStyle={true} onPress={() => {
          if (navigation.getState().routes[navigation.getState().index].name !== 'Profile') {
            navigation.navigate('Profile');
          }
        }} />,
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
      })
    }, [navigation, history.length])
  )
  return (
    <View style={styles.screenArea}>
      <SignUpForm />
    </View>
  )
}

const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: colors.screenContent },
  textScreen: { color: '#888' },
})