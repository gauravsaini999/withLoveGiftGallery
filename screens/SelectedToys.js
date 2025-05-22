import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text } from 'react-native';

export default function SelectedScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ title: 'Selected Toys' });
      }
    }, [navigation])
  );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>Your Selected Toys</Text>
    </View>
  )
}
