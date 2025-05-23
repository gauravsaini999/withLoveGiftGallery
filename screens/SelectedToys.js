import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../shared/colors'

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
    <View style={styles.screenArea}>
      <Text style={styles.textScreen}>Your Selected Toys</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: colors.screenContent },
  textScreen: { color: '#888'}
})
