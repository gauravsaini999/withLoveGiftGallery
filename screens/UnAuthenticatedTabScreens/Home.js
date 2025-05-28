import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ElevatedBox from '../../shared/elevated_box';
import MyCarousel from "../../shared/carousel";
import IOSBackButton from "../../components/CustomBackButton";
import { useNavigationHistory } from "../../zustand/useNavigationHistory";
import { useFirebaseInit } from "../../zustand/useFirebaseInit";
import { signOut } from 'firebase/auth';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';

export default function HomeScreen() {
  const { history, push } = useNavigationHistory();
  const navigation = useNavigation();

  const { logoutFn, loginFn, isLoggedIn } = useAuthenticationStateSlice();
  const { firebaseConfig, setApp, setAuth, app, auth } = useFirebaseInit();

  const [firebaseInitialized, setFirebaseInitialized] = React.useState(false);

  const [maxWidth, setMaxWidth] = React.useState(0);
  const [maxHeight, setMaxHeight] = React.useState(0);

  const [err, setErr] = React.useState('');

  const updateSize = ({ nativeEvent }) => {
    const { width, height } = nativeEvent.layout;
    setMaxWidth(prev => Math.max(prev, width));
    setMaxHeight(prev => Math.max(prev, height));
  };

  const commonStyle = {
    width: maxWidth || undefined,  // allow natural layout until max is known
    height: maxHeight || undefined,
  };

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent.setOptions({
        headerTitle: 'Home',
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
      });
    }, [navigation, history])
  );

  React.useLayoutEffect(() => {
    push('Home');
  }, []);

  React.useEffect(() => {
    loadFirebase();
  }, []);

  React.useEffect(() => {
    if (Object.keys(app).length && !Object.keys(auth).length) {
      loadAuth();
    }
  }, [app]);

  async function loadFirebase() {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    let app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    setApp(app);
    setFirebaseInitialized(true);
  }

  const loadAuth = async () => {
    const { initializeAuth, getReactNativePersistence } = await import('firebase/auth');
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    try {
      const auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      setAuth(auth);
    } catch (err) {
      console.log("error = ", err);
    }
  };

  React.useEffect(() => {
    const called = async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      onAuthStateChanged(auth, (user) => {
        console.log("user = ", user);
        if (user) {
          loginFn(user);
        }
      });
    }
    if (Object.keys(auth).length && !isLoggedIn) {
      called();
    }
  }, [auth])

  const handleLogout = async () => {
    try {
      await signOut(auth);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        logoutFn();
      }
    } catch (errMsg) {
      setErr('Error while signing out: ', errMsg);
      console.log('Error while signing out: ', errMsg);
    }
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     let unsubscribe = null;
  //     async function callable() {
  //       const { onAuthStateChanged } = await import('firebase/auth');
  //       unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //         if (currentUser) {
  //           const parent = navigation.getParent();
  //           parent.setOptions({
  //             headerRight: () => (<TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
  //               <Ionicons name="log-out-outline" size={24} color="#333" />
  //             </TouchableOpacity>)
  //           })
  //         }
  //       });
  //     }
  //     callable();
  //   }, [auth])
  // )
  if (!firebaseInitialized) {
    return (
      <View>
        <Text>Loading Firebase...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      <MyCarousel />
      <View style={styles.containerStyles}>
        <View style={styles.imageContainer}>
          <Image source={require('../../assets/logo2.png')} style={styles.image} />
        </View>
        <View style={styles.mainContent}>
          <View style={[styles.rowContent, { flex: 1 }]}>
            <View style={styles.boxItem}>
              <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require('../../assets/elephant_toy.png')} text={"Toys Needing Cells"} />
            </View>
            <View style={styles.boxItem}>
              <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require("../../assets/game.jpg")} text={"Board Games"} />
            </View>
          </View>
          <View style={[styles.rowContent, { flex: 1 }]}>
            <View style={styles.boxItem}>
              <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require("../../assets/car.jpg")} text={"Need No Cells"} />
            </View>
            <View style={styles.boxItem}>
              <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require("../../assets/outdoor.jpg")} text={"Outdoor Fun"} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    paddingBottom: 20,
    marginTop: 20,
  },
  containerStyles: {
    flex: 1
  },
  imageContainer: {
    flex: 1,
    margin: 10,
    alignItems: 'flex-start',
  },
  mainContent: {
    marginVertical: 20,
    flex: 4,
  },
  rowContent: {
    flexDirection: 'row',
    flex: 1,
    paddingBottom: 20,
  },
  boxItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});