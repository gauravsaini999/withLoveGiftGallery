import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import ElevatedBox from '../../shared/elevated_box';
import MyCarousel from "../../shared/carousel";
import IOSBackButton from "../../components/CustomBackButton";
import { useNavigationHistory } from "../../zustand/useNavigationHistory";
import { useFirebaseInit } from "../../zustand/useFirebaseInit";
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import { colors } from "../../shared/colors";

export default function HomeScreen() {
  const { history, push, reset: resetNavigationHistory, initPaths } = useNavigationHistory();
  const navigation = useNavigation();

  const { loginFn, isLoggedIn, userObj } = useAuthenticationStateSlice();
  const { firebaseConfig, setApp, setAuth, app, auth, setDb, db } = useFirebaseInit();

  const [maxWidth, setMaxWidth] = React.useState(0);
  const [maxHeight, setMaxHeight] = React.useState(0);

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
      push('Home');
      parent.setOptions({
        headerTitle: 'Home',
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
      });
    }, [navigation, history])
  );

  React.useEffect(() => {
    return () => {
      resetNavigationHistory();
    }
  }, []);

  React.useEffect(() => {
    if (initPaths.length) {
      console.log("<<<< Init Paths Array: ", initPaths);
    }
  }, [initPaths])

  async function loadFirebase() {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
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
        loginFn({ userObj: auth.currentUser  })
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
    backgroundColor: colors.contentColor,
    paddingTop: 50
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