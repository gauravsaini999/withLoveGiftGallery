import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';

export default function ProfileIconButton({ onPress, changeStyle }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <MaterialIcons name={changeStyle ? "account-circle" : "person-outline"} size={28} color={"#fefefe"}/>
    </TouchableOpacity>
  );
}