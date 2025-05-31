import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../shared/colors'
import { useNavigationHistory } from "../../zustand/useNavigationHistory";
import IOSBackButton from "../../components/CustomBackButton";

export default function SelectedScreen() {
  const navigation = useNavigation();
  const { history } = useNavigationHistory();

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        title: 'Selected Toys',
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
      });
    }, [navigation, history.length])
  );
  return (
    <View style={styles.screenArea}>
      <Text style={styles.textScreen}>Your Selected Toys</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: colors.contentColor },
  textScreen: { color: '#888' }
})
