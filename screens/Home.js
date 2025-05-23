import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ElevatedBox from '../shared/elevated_box';


export default function HomeScreen() {
  const navigation = useNavigation();

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
      if (parent) {
        parent.setOptions({ headerTitle: 'Home' });
      }
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../assets/logo2.png')} style={styles.image} />
      </View>
      <View style={styles.mainContent}>
        <View style={[styles.rowContent, { flex: 1}]}>
          <View style={styles.boxItem}>
            <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require('../assets/battery.webp')} text={"With Batteries"} />
          </View>
          <View style={styles.boxItem}>
            <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require("../assets/game.jpg")} text={"Board Games!"} />
          </View>
        </View>
        <View style={[styles.rowContent, { flex: 1 }]}>
          <View style={styles.boxItem}>
            <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require("../assets/car.jpg")} text={"No Batteries"} />
          </View>
          <View style={styles.boxItem}>
            <ElevatedBox boxStyle={commonStyle} onLayout={updateSize} image={require("../assets/outdoor.jpg")} text={"Outdoor Toys"} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageContainer: {
    flex: 1,
    margin: 10,
    alignItems: 'flex-start',
  },
  mainContent: {
    marginTop: 20,
    flex: 4,
  },
  rowContent: {
    flexDirection: 'row',
    flex: 1,
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