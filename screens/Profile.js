import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { View, StyleSheet, Button, Text, Keyboard, TouchableWithoutFeedback } from 'react-native';
import ProfileIconButton from '../components/ProfileButton';
import * as React from 'react';
import { colors } from '../shared/colors';
import IOSBackButton from '../components/CustomBackButton';
import { useNavigationHistory } from '../zustand/useNavigationHistory';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useFirebaseInit } from '../zustand/useFirebaseInit';
import CustomInput from '../components/CustomInput';

export default function ProfileScreen() {
  const { history } = useNavigationHistory();
  const route = useRoute();
  const navigation = useNavigation();
  const { auth } = useFirebaseInit();
  const [user, setUser] = React.useState(null);
  const [values, setValues] = React.useState({
    email: '',
    password: '',
    error: ''
  })
  const formType = route?.params?.formType;
  const [handler, setHandler] = React.useState({
    fn: () => { }
  })

  React.useEffect(() => {
    if (formType === 'Sign Up')
      setHandler({ fn: handleSignup })
    else
      setHandler({ fn: handleLogin })
  }, [formType])

  const handleChange = (inputIdentifier, enteredValue) => {
    setValues((previous) => {
      return {
        ...previous,
        [inputIdentifier]: enteredValue,
        error: ''
      }
    })
    if (user)
      handleLogout()
  }

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);  // Always set user, even if null (logged out)
      });
      return unsubscribe
    }, [auth]))

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => <ProfileIconButton changeStyle={true} onPress={() => {
          if (navigation.getState().routes[navigation.getState().index].name !== 'Profile') {
            navigation.navigate('Profile', { formType: 'Sign Up' });
          }
        }} />,
        headerLeft: history.length > 1 ? () => <IOSBackButton /> : null,
      })
    }, [navigation, history.length])
  )

  const validateInputs = () => {
    if (!values['email']) {
      setValues((previous) => {
        console.log(previous.email, previous.password)
        return { ...previous, error: 'Email is required.' }
      });
      return false;
    }
    if (!values['password']) {
      setValues((previous) => {
        return { ...previous, error: 'Password is required.' }
      });
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      const currentUser = auth.currentUser;
      if (currentUser) {
        handleReset();
      }
    } catch (err) {
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      Alert('Success', 'User logged in!');
      const currentUser = auth.currentUser;
      if (currentUser) {
        handleReset();
      }
    } catch (err) {
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        handleReset();
      }
    } catch (err) {
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleReset = () => {
    setValues({
      email: '',
      password: '',
      error: ''
    });
  }

  if (user) {
    return (
      <View style={styles.screenArea}>
        <Text style={styles.text}>Welcome, {user.email}!</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screenArea}>
        <CustomInput label="Username (email address)" textInputConfig={{
          keyboardType: 'email-address',
          placeholder: "Email",
          onChangeText: handleChange.bind(this, 'email'),
          autoCapitalize: "none",
          autoComplete: 'off',
          value: values.email,
          autoFocus: false
        }} />
        <CustomInput label="Password"
          textInputConfig={{
            placeholder: "Password",
            onChangeText: handleChange.bind(this, 'password'),
            keyboardType: "default",
            autoCapitalize: 'none',
            autoComplete: 'off',
            value: values.password,
            autoFocus: false,
          }} />
        {!!values.error && <Text style={styles.error}>{values.error}</Text>}
        <View style={styles.buttons}>
          <Button title={`${formType}`} onPress={handler.fn} />
          <Button title="Reset" onPress={handleReset} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  screenArea: { flex: 1, alignItems: 'center', paddingTop: 50, justifyContent: 'flex-start', textAlign: 'center', backgroundColor: colors.screenContent },
  textScreen: { color: '#888' },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    minWidth: 120,
    marginHorizontal: 8
  },
  error: { color: 'red', marginBottom: 10 },
  text: { fontSize: 18, marginBottom: 20 },
})