import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React from 'react'
import IntraScreenBackButton from '../../components/IntraScreenBackButton';
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { signOut } from 'firebase/auth';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';

const EditProfile = () => {
  const navigation = useNavigation();
  const { history, push, reset } = useNavigationHistory();
  const { auth } = useFirebaseInit();
  const { logoutFn } = useAuthenticationStateSlice();

  useFocusEffect(
    React.useCallback(() => {
      // alert("<< EditProfile >>==" + JSON.stringify(auth));
      navigation.setOptions({
        headerTitle: 'Edit Profile',
        headerLeft: () => <IntraScreenBackButton />,
        headerRight: () => (<TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>)
      })
    }, [navigation, history])
  );
  
  const handleLogout=async() => {
    try {
      await signOut(auth);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        logoutFn();
      }
    } catch (errMsg) {
      console.log('Error while signing out: ', errMsg);
    }
  };

  React.useLayoutEffect(() => {
    reset();
    push('Edit Profile');
  }, []);

  return (
    <View style={styles.ScreenContainer}>
      <Text style={styles.TextStyle}>MY EDITING A PROFILE PAGE</Text>
    </View>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  ScreenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  TextStyle: { fontSize: 24, color: '#999' }
})