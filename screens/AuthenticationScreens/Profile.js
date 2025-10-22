import * as React from 'react';
import { View, ScrollView, StatusBar, Platform, UIManager, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LoginScreen from "react-native-login-screen";
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import IOSBackButton from '../../components/CustomBackButton';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, deleteUser } from 'firebase/auth';
import ProfileIconButton from '../../components/ProfileButton';
import TextInput from "react-native-text-input-interactive";
import Toast from 'react-native-toast-message';
import { width as ScreenWidth, height as ScreenHeight } from '../../shared/GetScreenSize';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}



const ProfileScreen = () => {
  const passwordFocusTime = React.useRef(0);
  // const debounceTimeout = React.useRef(null);
  const autofillThreshold = 50; // milliseconds
  const { push } = useNavigationHistory();
  const navigation = useNavigation();
  const { auth, db } = useFirebaseInit();
  const { loginFn } = useAuthenticationStateSlice();
  const [enableSignUp, setEnableSignUp] = React.useState({ value: false, from: "auth init" });
  const [visible, setVisible] = React.useState(true);
  const [values, setValues] = React.useState({
    username: 'your-email@domain.com',
    password: 'your-case-sensitive-password',
    repassword: 'your-case-sensitive-password',
    error: ''
  });
  const focusRef = React.useRef(null)
  const [focusVal, setFocusVal] = React.useState('')

  const decideNEmpty = () => {
    if (enableSignUp["value"]) {
      setValues({
        username: '', password: '', repassword: '', error: ''
      })
    }
    else {
      setValues({
        username: '', password: '', error: ''
      })
      if (enableSignUp['from'] === "sign up flow") {

      }
    }
  }

  React.useEffect(() => {
    decideNEmpty();
  }, [enableSignUp["value"]])


  React.useLayoutEffect(() => {
    push('Authenticate Screen');
  }, []);

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

  const handleUsernameFocus = () => {
    focusRef.current = 'username_focussed';
    setFocusVal(focusRef.current);
  }

  const handlePasswordFocus = () => {
    focusRef.current = 'password_focussed';
    setFocusVal(focusRef.current);
    passwordFocusTime.current = Date.now();
  }

  React.useEffect(() => {
    if (focusVal == 'username_focussed') {
      setValues(prev => {
        return { ...prev, username: '' }
      })
    }
    else if (focusVal == 'password_focussed') {
      setValues(prev => {
        return { ...prev, password: '' }
      })
    }
  }, [focusVal])

  const validateInputs = () => {
    if (values['username'] == '') {
      setValues((previous) => {
        return { ...previous, error: 'Email is required.' }
      });
      return false;
    }
    if (values['password'] == '') {
      setValues((previous) => {
        return { ...previous, error: 'Password is required.' }
      });
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    const validated = validateInputs();
    if (!validated) return;
    try {
      await createUserWithEmailAndPassword(auth, values.username, values.password).then(async () => {
        const user = await auth.currentUser;
        if (user) {
          const { doc, setDoc } = await import('firebase/firestore')
          await setDoc(doc(db, 'users', user.uid), { email: values.username, createdAt: new Date() }).then(() => {
            console.log('Success', 'Your profile has been updated!')
          }).catch(async (error) => {
            await deleteUser(user)
              .then(() => {
                console.log('User deleted')
              })
              .catch((err) => {
                console.error('Error deleting user:', err)
              });
            console.log('Error in updating db while signup', error.message)
          });
          async function cb() {
            await sendEmailVerification(user).then(() => {
              Toast.show({
                type: 'success',
                text1: 'Verification Email Sent!',
                text2: 'Check your inbox to verify your account.',
                position: 'top',
                topOffset: 100,
                autoHide: false,
                onPress: () => Toast.hide(),
                props: { fontSize: 25, fontFamily: 'ComicSansMS' }
              })
            }).catch((err) => {
              console.log(err, 'error while logging out !!');
              deleteUser(user)
                .then(() => {
                  console.log('User deleted');
                })
                .catch((err) => {
                  console.error('Error deleting user:', err);
                })
            })
          }
          setEnableSignUp({ value: false, from: "sign up flow" });
          handleReset(cb);
        }
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Signup Error',
        text2: err.message,
        position: 'top',
        topOffset: 100,
        autoHide: false,
        onPress: () => Toast.hide(),
        props: { fontSize: 25, fontFamily: 'ComicSansMS' }
      });
      if (user) {
        deleteUser(user)
          .then(() => {
            console.log('User deleted');
          })
          .catch((err) => {
            console.error('Error deleting user:', err);
          });
      }
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleSignIn = async () => {
    const validated = validateInputs();
    if (!validated) return;
    try {
      await signInWithEmailAndPassword(auth, values.username, values.password);
      await auth.currentUser.reload();
      const currentUser = auth.currentUser;
      if (currentUser) {
        loginFn({ userObj: currentUser });
        async function sendVerify() {
          await sendEmailVerification(currentUser);
          Toast.show({
            type: 'success',
            text1: 'Verification Email Sent Again!',
            text2: 'Check your Inbox / Spam/ Junk to verify your account.',
            position: 'top',
            topOffset: 100,
          });
        }
        async function cb() {
          if (currentUser.emailVerified) {
            const isPhoneLinked = currentUser.phoneNumber == undefined ? null : true;
            if (!isPhoneLinked) {
              console.log("isPhoneLinked = ", isPhoneLinked);
              Toast.show({
                type: 'info',
                text1: 'Verify Your Mobile Number!',
                text2: 'Please link your mobile number with your account.',
                position: 'top',
                topOffset: 100,
              });
              navigation.navigate('Auth', { screen: 'Phone Link' });
            }
            console.log('Email is verified, navigating to Home screen');
            navigation.navigate('Home');
          }
          else {
            await sendVerify();
          }
        }
        handleReset(cb);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Signin Error',
        text2: err.message,
        position: 'top',
        topOffset: 100,
      });
      setValues((previous) => {
        return { ...previous, error: err.message }
      });
    }
  };

  const handleReset = (cb) => {
    decideNEmpty();
    if (cb) {
      cb()
    }
  }

  const renderSignupLoginScreen = () => (
    <LoginScreen
      logoImageStyle={{ width: ScreenWidth / 2.5, resizeMode: 'contain' }}
      logoImageSource={require('../../assets/logo2.png')}
      onLoginPress={handleSignup}
      onSignupPress={() => { setEnableSignUp({ value: false, from: "sign up button press" }) }}
      onEmailChange={handleChange.bind(this, 'username')}
      loginButtonText={'Sign Up'}
      signupText={"Sign In Instead"}
      // enablePasswordValidation
      emailTextInputProps={{
        textInputStyle: { fontSize: 12, maxWidth: ScreenWidth * 0.6, maxHeight: 40 }
      }}
      passwordTextInputProps={{
        textInputStyle: { fontSize: 12, maxWidth: ScreenWidth * 0.6, maxHeight: 40 }
      }}
      textInputChildren={
        <View style={{ marginTop: 16 }}>
          <TextInput
            placeholder="Re-Password"
            secureTextEntry={visible}
            onChangeText={handleChange.bind(this, 'repassword')}
            enableIcon={true}
            iconImageSource={!visible ? require('../../assets/eye.png') : require('../../assets/eye-off.png')}
            onIconPress={() => setVisible(v => !v)}
            textInputStyle={{ width: ScreenWidth * 0.6, maxHeight: 40, fontSize: 12 }}
          />
        </View >
      }
      onPasswordChange={handleChange.bind(this, 'password')}
      disableSocialButtons={true}
      dividerStyle={{ display: 'none' }}
      loginButtonStyle={{ maxWidth: ScreenWidth * 0.5, height: 40 }}
      loginTextStyle={{ fontSize: 12 }}
      signupTextStyle={{ fontSize: 12 }}
    />
  )

  const renderLoginScreen = () => (
    <LoginScreen
      logoImageSource={require('../../assets/logo2.png')}
      signupText={"Sign Up Instead"}
      onLoginPress={handleSignIn}
      onSignupPress={() => setEnableSignUp({ value: true, from: "sign up button press" })}
      onEmailChange={handleChange.bind(this, 'username')}
      onPasswordChange={handleChange.bind(this, 'password')}
      loginTextStyle={{ fontSize: 12 }}
      loginButtonText={'Sign In'}
      dividerStyle={{ display: 'none' }}
      logoImageStyle={{ width: ScreenWidth / 2.5, resizeMode: 'contain' }}
      emailTextInputProps={{
        autoComplete: "email",
        textContentType: "emailAddress",
        returnKeyType: "next",
        onFocus: handleUsernameFocus,
        value: values['username'],
        textInputStyle: { fontSize: 12, maxWidth: ScreenWidth * 0.6, maxHeight: 40 }
      }}
      passwordTextInputProps={{
        autoComplete: "password",
        textContentType: "password",
        returnKeyType: "done",
        onFocus: handlePasswordFocus,
        value: values['password'],
        textInputStyle: { fontSize: 12, maxWidth: ScreenWidth * 0.6, maxHeight: 40 }
      }}
      disableSocialButtons={true}
      loginButtonStyle={{ maxWidth: ScreenWidth * 0.5, height: 40 }}
      signupTextStyle={{ fontSize: 12 }}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar barStyle="light-content" />
          {enableSignUp["value"] ? renderSignupLoginScreen() : renderLoginScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

export default ProfileScreen;


