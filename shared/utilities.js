import { View, Text, StyleSheet, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


export const debounceAsync = (fn, delay) => {
  let timeoutId;

  return (...args) => {
    return new Promise((resolve, reject) => {
      // Clear the existing timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Set a new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };
}

const ICONS = {
  success: { name: 'check-circle', color: '#2e7d32', backgroundColor: '#c8e6c9' },
  error: { name: 'error-outline', color: '#d32f2f', backgroundColor: '#ffcdd2' },
  info: { name: 'info-outline', color: '#1976d2', backgroundColor: '#bbdefb' },
};

export const CustomToast = ({ text1, text2, type = 'info', props }) => {
  const { name, color, backgroundColor } = ICONS[type] || ICONS.info;

  return (
    <View style={[styles.toastContainer, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={name} size={28} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text1, { fontSize: props?.fontSize || 18, fontFamily: props?.fontFamily, color }]}>
          {text1}
        </Text>
        {!!text2 && (
          <Text style={[styles.text2, { fontSize: (props?.fontSize || 18) - 4, fontFamily: props?.fontFamily, color }]}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 3,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontWeight: 'bold',
  },
  text2: {
    marginTop: 4,
  },
});