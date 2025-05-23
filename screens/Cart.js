import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CartScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ title: 'Cart' });
      }
    }, [navigation])
  );
  return (
    <View style={styles.screenArea}>
      <Text style={styles.textScreen}>Cart Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'rgba(24, 187, 12, 0.5)' },
  textScreen: { color: '#FFF'}
})