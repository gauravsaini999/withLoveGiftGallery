import { useNavigation } from "@react-navigation/native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../shared/colors'
import IOSBackButton from "../../components/CustomBackButton";
import { useNavigationHistory } from "../../zustand/useNavigationHistory";

export default function CartScreen() {
  const { history } = useNavigationHistory();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        title: 'Cart',
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
      });
    }, [navigation, history.length])
  );

  return (
    <View style={styles.screenArea}>
      <Text style={styles.textScreen}>Cart Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: colors.screenContent },
  textScreen: { color: '#888' }
})