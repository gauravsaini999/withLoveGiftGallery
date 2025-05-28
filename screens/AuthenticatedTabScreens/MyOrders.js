import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as React from 'react'
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { signOut } from 'firebase/auth';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import IOSBackButton from '../../components/CustomBackButton';

const MyOrders = () => {
  const navigation = useNavigation();
  const { history } = useNavigationHistory();
  const { auth } = useFirebaseInit();
  const { logoutFn } = useAuthenticationStateSlice();

  useFocusEffect(
    React.useCallback(() => {
      // alert("<< EditProfile >>==" + JSON.stringify(auth));
      navigation.setOptions({
        headerTitle: 'My Orders',
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
        headerRight: () => (<TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>)
      })
    }, [navigation, history])
  );

  const handleLogout = async() => {
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

  return (
    <View style={styles.ScreenContainer}>
      <Text style={styles.TextStyle}>MY ORDERS PAGE</Text>
    </View>
  )
}

export default MyOrders

const styles = StyleSheet.create({
  ScreenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  TextStyle: { fontSize: 24, color: '#999' }
})