import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';

export default function ProfileIconButton({ onPress, changeStyle }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <MaterialIcons name={changeStyle ? "account-circle" : "person-outline"} size={28} color={"#444"}/>
    </TouchableOpacity>
  );
}