import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import ProfileIconButton from '../components/ProfileButton';
import * as React from 'react';
import { colors } from '../shared/colors';
import SignUpForm from './login/SignupForm';

export default function ProfileScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => <ProfileIconButton changeStyle={true} onPress={() => {
          navigation.navigate('Profile');
        }} />
      })
    }, [navigation])
  )
  return (
    <View style={styles.screenArea}>
      <SignUpForm />
    </View>
  )
}

const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: colors.screenContent },
  textScreen: { color: '#888'}
})