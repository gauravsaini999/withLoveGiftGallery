import * as React from 'react';
import { View, ScrollView, Text, StatusBar, Platform, UIManager, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LoginScreen from "react-native-login-screen";
import { useFirebaseInit } from '../zustand/useFirebaseInit';
import { useNavigationHistory } from '../zustand/useNavigationHistory';
import { useAuthenticationStateSlice } from '../zustand/useAuthenticationStateSlice';
import IOSBackButton from '../components/CustomBackButton';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import ProfileIconButton from '../components/ProfileButton';
import TextInput from "react-native-text-input-interactive";

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = () => {
  const [enableSignUp, setEnableSignUp] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [values, setValues] = React.useState({
    username: '',
    password: '',
    repassword: '',
    error: ''
  });
  const { history } = useNavigationHistory();
  const navigation = useNavigation();
  const { auth } = useFirebaseInit();
  const { loginFn, logoutFn, isLoggedIn, userObj } = useAuthenticationStateSlice();
  const [user, setUser] = React.useState(null);

  // React.useLayoutEffect(() => {
  //   handleLogout();
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);  // Always set user, even if null (logged out)
        console.log('currentUser' + currentUser);
        if (currentUser) {
          navigation.navigate('Home');
        }
      });
      return () => {
        unsubscribe();
      }
    }, [auth]))

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
    }, [navigation, history.length]))

  const handleChange = (inputIdentifier, enteredValue) => {
    setValues((previous) => {
      return {
        ...previous,
        [inputIdentifier]: enteredValue,
        error: ''
      }
    })
  }

  const validateInputs = () => {
    if (!values['username']) {
      setValues((previous) => {
        alert(previous.username, previous.password)
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
      const userCredential = await createUserWithEmailAndPassword(auth, values.username, values.password);
      const user = userCredential.user;
      if (user) {
        alert('Hurray !!!')
        handleReset();
      }
    } catch (err) {
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;
    try {
      await signInWithEmailAndPassword(auth, values.username, values.password);
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        loginFn(currentUser);
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
        logoutFn();
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
      repassword: '',
      error: ''
    });
  }

  React.useEffect(() => {
    console.log({ "isLoggedIn": isLoggedIn, "userObj": userObj })
  }, [userObj, isLoggedIn])

  const renderSignupLoginScreen = () => (
    <LoginScreen
      logoImageSource={require('../assets/logo2.png')}
      onLoginPress={() => handleSignup()}
      // onSignupPress={() => handleSignup()}
      onEmailChange={handleChange.bind(this, 'username')}
      loginButtonText={'Create an account'}
      disableSignup
      // enablePasswordValidation
      textInputChildren={
        <View style={{ marginTop: 16 }}>
          <TextInput
            placeholder="Re-Password"
            secureTextEntry={!visible}
            onChangeText={handleChange.bind(this, 'repassword')}
            enableIcon={true}
            iconImageSource={visible ? require('../assets/eye.png') : require('../assets/eye-off.png')}
            onIconPress={() => setVisible(v => !v)}
          />
          {values.error && <Text>{values.error}</Text>}
        </View >
      }
      onPasswordChange={handleChange.bind(this, 'password')}
    />)

  const renderLoginScreen = () => (
    <LoginScreen
      logoImageSource={require('../assets/logo2.png')}
      onLoginPress={() => { handleSignIn() }}
      onSignupPress={() => setEnableSignUp(true)}
      onEmailChange={handleChange.bind(this, 'username')}
      onPasswordChange={handleChange.bind(this, 'password')}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        {enableSignUp ? renderSignupLoginScreen() : renderLoginScreen()}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

export default ProfileScreen;
