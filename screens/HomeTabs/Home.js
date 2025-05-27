import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import ElevatedBox from '../../shared/elevated_box';
import MyCarousel from "../../shared/carousel";
import IOSBackButton from "../../components/CustomBackButton";
import { useNavigationHistory } from "../../zustand/useNavigationHistory";
import { useFirebaseInit } from "../../zustand/useFirebaseInit";

export default function HomeScreen() {
  const { history, push } = useNavigationHistory();
  const navigation = useNavigation();

  const { firebaseConfig, setApp, setAuth, app } = useFirebaseInit();

  const [firebaseInitialized, setFirebaseInitialized] = React.useState(false);

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
    async function loadFirebase() {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      let app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      setApp(app);
      setFirebaseInitialized(true);
    }
    loadFirebase(); // Call the async function inside useEffect
  }, []);

  React.useEffect(() => {
    async function getAuth() {
      const { initializeAuth, getReactNativePersistence, getAuth } = await import('firebase/auth');
      const fn = () => {
        let _auth;
        try {
          _auth = getAuth(); // Try to get existing auth instance
        } catch (error) {
          _auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        }
        setAuth(_auth);
      }
      fn();
    }
    if (app) {
      getAuth();
    }
  }, [app]);

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