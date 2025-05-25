import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native';
import { colors } from '../shared/colors';
import { useNavigationHistory } from '../zustand/useNavigationHistory';

export default function IOSBackButton() {
  const { history } = useNavigationHistory();
  const navigation = useNavigation();
  const nameResolve = history[history.length-2] == 'HomeScreen' ? 'Home' : history[history.length-2];
  return (
    <TouchableOpacity onPress={() => history.length > 1 ? navigation.navigate(`${nameResolve}`) : null} style={styles.backButton}>
      <Ionicons
        name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
        size={24}
        color={colors.backButton}
      />
      {Platform.OS === 'ios' && <Text style={styles.backText}>Back</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
