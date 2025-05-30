import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { View, ScrollView, Text, StatusBar, Platform, UIManager, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, StyleSheet, Button } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LoginScreen from "react-native-login-screen";
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import IOSBackButton from '../../components/CustomBackButton';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import ProfileIconButton from '../../components/ProfileButton';
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

  const decider = () => {
    if (enableSignUp) {
      setValues({
        username: '', password: '', repassword: '', error: ''
      })
    }
    else {
      setValues({
        username: '', password: '', error: ''
      })
    }
  }

  React.useEffect(() => {
    decider();
  }, [enableSignUp])

  const passwordFocusTime = React.useRef(0);
  // const debounceTimeout = React.useRef(null);
  const autofillThreshold = 50; // milliseconds
  const { history } = useNavigationHistory();
  const navigation = useNavigation();
  const { auth, user, setUser } = useFirebaseInit();
  const { loginFn, isLoggedIn } = useAuthenticationStateSlice();

  React.useEffect(() => {
    if (isLoggedIn) {
      navigation.navigate('Edit Profile');
    }
  }, [isLoggedIn])

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
    setValues((prev) => {
      return {
        ...prev,
        [inputIdentifier]: enteredValue,
        error: prev.error
      }
    })
    if (inputIdentifier === 'password') {
      const elapsed = Date.now() - passwordFocusTime.current;
      if (!values.password && elapsed < autofillThreshold) {
        console.log('Password autofilled!');
        Keyboard.dismiss();
      }
      else if (values.password && values.password == enteredValue) {
        Keyboard.dismiss();
      }
      // if (debounceTimeout.current) {
      //   clearTimeout(debounceTimeout.current);
      // }

      // // Start a new debounce timeout
      // debounceTimeout.current = setTimeout(() => {
      //   if (enteredValue.length > 0) {
      //     console.log('User idle after password entry. Dismissing keyboard...');
      //     Keyboard.dismiss();
      //   }
      // }, 1000); // 2 second debounce
    }
  }

  // React.useEffect(() => {
  //   return () => {
  //     if (debounceTimeout.current) {
  //       clearTimeout(debounceTimeout.current);
  //     }
  //   };
  // }, []);

  const handlePasswordFocus = () => {
    passwordFocusTime.current = Date.now();
  }

  const validateInputs = () => {
    if (!values['username']) {
      setValues((previous) => {
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
        loginFn(currentUser);
        handleReset();
      }
    } catch (err) {
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleReset = () => {
    decider();
  }

  const renderSignupLoginScreen = () => (
    <View style={styles.container}>
      <LoginScreen
        logoImageSource={require('../../assets/logo2.png')}
        onLoginPress={() => handleSignup()}
        onSignupPress={() => setEnableSignUp(false)}
        onEmailChange={handleChange.bind(this, 'username')}
        loginButtonText={'Create an account'}
        signupText={"Back to Sign In"}
        // enablePasswordValidation
        textInputChildren={
          <View style={{ marginTop: 16 }}>
            <TextInput
              placeholder="Re-Password"
              secureTextEntry={!visible}
              onChangeText={handleChange.bind(this, 'repassword')}
              enableIcon={true}
              iconImageSource={visible ? require('../../assets/eye.png') : require('../../assets/eye-off.png')}
              onIconPress={() => setVisible(v => !v)}
            />
            {values.error && <Text>{values.error}</Text>}
          </View >
        }
        onPasswordChange={handleChange.bind(this, 'password')}
      />
    </View>)

  const renderLoginScreen = () => (
    <LoginScreen
      logoImageSource={require('../../assets/logo2.png')}
      onLoginPress={() => { handleSignIn() }}
      onSignupPress={() => setEnableSignUp(true)}
      onEmailChange={handleChange.bind(this, 'username')}
      onPasswordChange={handleChange.bind(this, 'password')}
      emailTextInputProps={{
        autoComplete: "email",
        textContentType: "emailAddress",
        returnKeyType: "next",
      }}
      passwordTextInputProps={{
        autoComplete: "password",
        textContentType: "password",
        returnKeyType: "done",
        onFocus: handlePasswordFocus,
      }}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <StatusBar barStyle="light-content" />
          {enableSignUp ? renderSignupLoginScreen() : renderLoginScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center in the middle
  },
  autoButton: {
    paddingHorizontal: 20, // Adjust as needed
    paddingVertical: 10,
    backgroundColor: '#2089dc',
  },
  buttonContainer: {
    alignSelf: 'flex-start', // Shrinks to fit content
  },
});
