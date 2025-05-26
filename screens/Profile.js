import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, TextInput, Button, Text } from 'react-native';
import ProfileIconButton from '../components/ProfileButton';
import * as React from 'react';
import { colors } from '../shared/colors';
import IOSBackButton from '../components/CustomBackButton';
import { useNavigationHistory } from '../zustand/useNavigationHistory';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useFirebaseInit } from '../zustand/useFirebaseInit';

export default function ProfileScreen() {
  const { history } = useNavigationHistory();
  const navigation = useNavigation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [user, setUser] = React.useState(null);

  const { auth } = useFirebaseInit();

  useFocusEffect(
    React.useCallback(() => {
      alert(JSON.stringify(auth));
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);  // Always set user, even if null (logged out)
      });
      return unsubscribe
    }, [auth])
  )

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => <ProfileIconButton changeStyle={true} onPress={() => {
          if (navigation.getState().routes[navigation.getState().index].name !== 'Profile') {
            navigation.navigate('Profile');
          }
        }} />,
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
      })
    }, [navigation, history.length])
  )

  const validateInputs = () => {
    if (!email) {
      setError('Email is required.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'User account created!');
      setEmail('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <View style={styles.screenArea}>
        <Text style={styles.text}>Welcome, {user.email}!</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={styles.screenArea}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button title="Sign Up" onPress={handleSignup} />
      <View style={{ marginTop: 10 }} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  )
}

const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: colors.screenContent },
  textScreen: { color: '#888' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  error: { color: 'red', marginBottom: 10 },
  text: { fontSize: 18, marginBottom: 20 },
})