import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ElevatedBox from '../../shared/elevated_box';
import MyCarousel from "../../shared/carousel";
import IOSBackButton from "../../components/CustomBackButton";
import { useNavigationHistory } from "../../zustand/useNavigationHistory";
import { useFirebaseInit } from "../../zustand/useFirebaseInit";
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import { colors } from "../../shared/colors";
import ProfileIconButton from '../../components/ProfileButton';
import { signOut } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { MaterialIcons } from '@expo/vector-icons';
import IntraScreenBackButton from "../../components/IntraScreenBackButton";

export default function HomeScreen() {
  const { history, push, reset: resetNavigationHistory, initPaths } = useNavigationHistory();
  const navigation = useNavigation();
  const { loginFn, isLoggedIn, userObj, logoutFn } = useAuthenticationStateSlice();
  const { firebaseConfig, setApp, setAuth, app, auth, setDb, db } = useFirebaseInit();

  React.useLayoutEffect(() => {
    push('Home');
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const handleLogout = async () => {
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
      const parent = navigation.getParent();
      parent.setOptions({
        headerTitle: 'Home',
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : () => <IntraScreenBackButton />,
        headerRight: () => (isLoggedIn ?
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <MaterialIcons name="logout" size={20} color="#333" style={{ marginRight: 10 }} />
          </TouchableOpacity> : <ProfileIconButton onPress={() => {
            navigation.navigate('Auth', { screen: "Authenticate Screen" });
          }} changeStyle={false} />),
      })
    }, [navigation, history])
  );

  React.useEffect(() => {
    return () => {
      resetNavigationHistory();
    }
  }, []);

  async function loadFirebase() {
    let app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    setApp(app);
  }

  React.useEffect(() => {
    if (!userObj) {
      loadFirebase();
    }
  }, []);

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
    if (!userObj && Object.keys(app).length && !Object.keys(auth).length) {
      loadAuth();
    }
  }, [app]);

  React.useEffect(() => {
    const called = async () => {
      if (!isLoggedIn && !userObj) {
        console.log("NOT LOGGED IN AND NO USER OBJ IN ZUSTAND STATE")
        const { onAuthStateChanged } = await import('firebase/auth');
        onAuthStateChanged(auth, (user) => {
          console.log("user = ", user);
          if (user) {
            loginFn({ userObj: user });
          }
        });
      }
      else {
        console.log("ALREADY LOGGED IN AND JUST REFRESHING THE ZUSTAND USER STATE BY RELOADING")
        await auth.currentUser.reload();
        loginFn({ userObj: auth.currentUser })
      }
    }
    if (Object.keys(auth).length) {
      called();
    }
  }, [auth])

  React.useEffect(() => {
    const getDb = async () => {
      const { getFirestore } = await import('firebase/firestore');
      try {
        const db_ = getFirestore(app);
        if (db_) {
          setDb(db_)
          const { doc, getDoc } = await import('firebase/firestore');
          const profileRef = doc(db, 'users', userObj.uid); // adjust path if needed
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            if (profileData['phoneLinked']) {
              loginFn({ userObj: userObj })
            }
          }
        }
      }
      catch (err) {
        console.log("Error while getting db instance: ", err);
      }
    }
    if (Object.keys(app).length && Object.keys(auth).length) {
      getDb();
    }
  }, [app, auth])

  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      <View style={styles.carouselContainer}>
        <MyCarousel />
      </View>
      <View style={styles.cardContainer}>
        <View style={styles.row}>
          <View style={styles.box}>
            <ElevatedBox image={require('../../assets/elephant_toy.png')} text={"With Batteries"} />
          </View>
          <View style={styles.box}>
            <ElevatedBox image={require("../../assets/game.jpg")} text={"Board Games"} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.box}>
            <ElevatedBox image={require("../../assets/car.jpg")} text={"Manual Toys"} />
          </View>
          <View style={styles.box}>
            <ElevatedBox image={require("../../assets/outdoor.jpg")} text={"Outdoor Fun"} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: colors.screenContent[1],
  },
  carouselContainer: {
    flex: 1,
  },
  cardContainer: {
    flex: 1.4,
    justifyContent: 'space-around',
    alignItems: 'space-around',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});