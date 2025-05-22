import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text } from 'react-native';

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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>Cart Screen</Text>
    </View>
  )
}