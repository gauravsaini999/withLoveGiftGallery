import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text } from 'react-native';
import ProfileIconButton from '../components/ProfileButton';
import * as React from 'react';

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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>Your Profile Screen</Text>
    </View>
  )
}