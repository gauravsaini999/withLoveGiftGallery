import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React from 'react'
import IOSBackButton from "../../components/CustomBackButton";
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { signOut } from 'firebase/auth';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EditProfile = () => {
  const navigation = useNavigation();
  const { history, push, reset } = useNavigationHistory();
  const { logoutFn } = useAuthenticationStateSlice();
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerTitle: 'Edit Profile',
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
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
        navigation.navigate('Home');
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
    <View>
      <Text></Text>
    </View>
  )
}

export default EditProfile

const styles = StyleSheet.create({})