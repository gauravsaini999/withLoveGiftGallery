import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { colors } from '../shared/colors';

export default function ProfileIconButton({ onPress, changeStyle }) {
  return (
    <TouchableOpacity onPress={onPress}>
      {changeStyle ? <MaterialIcons name="account-circle" size={36} color={colors.profileIcon}/> : <Ionicons name="person-circle-outline" size={36} color={colors.profileIcon} />}
    </TouchableOpacity>
  );
}