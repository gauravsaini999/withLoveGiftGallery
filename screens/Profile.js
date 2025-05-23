import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.screenArea}>
      <Text style={styles.textScreen}>Your Profile Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'rgba(24, 187, 12, 0.5)' },
  textScreen: { color: '#FFF'}
})