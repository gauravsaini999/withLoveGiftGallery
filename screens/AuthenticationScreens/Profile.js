import * as React from 'react';
import { View, ScrollView, Text, StatusBar, Platform, UIManager, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LoginScreen from "react-native-login-screen";
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import IOSBackButton from '../../components/CustomBackButton';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import ProfileIconButton from '../../components/ProfileButton';
import TextInput from "react-native-text-input-interactive";
import Toast from 'react-native-toast-message';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = () => {
  const [enableSignUp, setEnableSignUp] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [phoneSignUp, setPhoneSignUp] = React.useState(false);
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
  const { history, push, reset, setProfilePress } = useNavigationHistory();
  const navigation = useNavigation();
  const { auth } = useFirebaseInit();
  const { loginFn, isLoggedIn } = useAuthenticationStateSlice();

  useFocusEffect(
    React.useCallback(() => {
      push("Authenticate Screen");
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent.setOptions({
        headerRight: () => <ProfileIconButton changeStyle={true} onPress={() => {
          if (navigation.getState().routes[navigation.getState().index].name !== 'Authenticate Screen') {
            navigation.navigate('Auth', { screen: "Authenticate Screen" });
          }
        }} />,
        headerLeft: () => <IOSBackButton />,
      })
    }, [navigation]))

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
        await sendEmailVerification(user);
        Toast.show({
          type: 'success',
          text1: 'Verification Email Sent!',
          text2: 'Check your inbox to verify your account.',
        });
        Toast.show({
          type: 'Info',
          text1: 'Verify Your Mobile Number!',
          text2: 'Please link your mobile number with your account.',
        });
        navigation.navigate('Auth', { screen: 'Phone Link' });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Signup Error',
        text2: err.message,
      });
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
        loginFn({ userObj: currentUser, phoneAuth: 'not-done' });
        reset();
        setProfilePress(true);
        function cb() {
          navigation.navigate('Edit Profile');
        }
        handleReset(cb());
      }
    } catch (err) {
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleReset = (cb) => {
    decider();
    if (cb) {
      cb
    }
  }

  const renderSignupLoginScreen = () => (
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
  )

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
