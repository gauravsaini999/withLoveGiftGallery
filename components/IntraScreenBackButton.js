import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import { colors } from '../shared/colors';
import { useNavigationHistory } from '../zustand/useNavigationHistory';
import { useNavigation } from '@react-navigation/native';

export default function IntraScreenBackButton() {
  const { activeRoute, reset, history } = useNavigationHistory();
  const navigation = useNavigation();
  return (
    <View style={styles.backContainer}>
      {history.length > 1 && <TouchableOpacity onPress={() => {
        reset(activeRoute);
        navigation.goBack();
      }}
        style={styles.backButton}>
        <Ionicons
          name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
          size={24}
          color={colors.backButton}
        />
      </TouchableOpacity>}
      <TouchableOpacity onPress={() => {
        navigation.navigate('Home');
        reset('Home');
      }}>
        <Ionicons
          name={activeRoute === "Home Screen" ? "home" : "home-outline"}
          size={24}
          color={colors.backButton}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 80,
    marginLeft: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  backText: {
    color: colors.backButtonText,
    fontSize: 17,
    marginLeft: 2,
  },
});
