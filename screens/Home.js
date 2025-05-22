import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    margin: 10,

    alignItems: 'flex-start',
  },
  image: {
    borderRadius: 15,
    borderColor: 'rgba(255, 105, 180, 0.9)',
    borderWidth: 2,
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
});

export default function HomeScreen() {
  const navigation = useNavigation();

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
        <Image source={require('../assets/logo.png')} style={styles.image} />
      </View>
    </View>
  );
}