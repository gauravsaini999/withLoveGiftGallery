import * as React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomInput = ({ label, textInputConfig }) => {

  const [visible, setVisible] = React.useState(false);
  
  const AddEyeIcon = () => (
    <TouchableOpacity onPress={() => setVisible(v => !v)}>
      <MaterialCommunityIcons name={visible ? "eye-off" : "eye"} size={20} color="#555" />
    </TouchableOpacity >
  )

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      {label == 'Password' ?
        <View style={[styles.passwordContainer, { width: 200, paddingRight: 6 }]}>
          <TextInput style={[styles.input, { flex: 1 }]} {...textInputConfig} secureTextEntry={!visible} />
          <AddEyeIcon />
        </View> :
        <TextInput style={[styles.input, { width: 200}]} {...textInputConfig} />
      }
    </View>
  )
}

export default CustomInput;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    Width: 200,
    backgroundColor: '#CCC'
  },
  input: {
    backgroundColor: '#CCC',
    padding: 6,
    color: '#333333',
    borderRadius: 6,
    fontSize: 18,
  },
})