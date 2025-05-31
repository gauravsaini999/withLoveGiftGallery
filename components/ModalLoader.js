import { Modal, View, ActivityIndicator, StyleSheet } from 'react-native';

const ModalLoader = ({ visible }) => {
  console.log(visible, 'visible.....')
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModalLoader;