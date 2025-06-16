import * as React from 'react';
import { View, ScrollView, Button, Text, StatusBar, Platform, UIManager, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, StyleSheet } from 'react-native';
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
import { debounceAsync } from '../../shared/utilities';

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
  const { push, reset } = useNavigationHistory();
  const navigation = useNavigation();
  const { auth, db } = useFirebaseInit();
  const { loginFn, logoutFn } = useAuthenticationStateSlice();
  const [enableSignUp, setEnableSignUp] = React.useState({ value: false, from: "auth init"});
  const [visible, setVisible] = React.useState(false);
  const [values, setValues] = React.useState({
    username: '',
    password: '',
    repassword: '',
    error: ''
  });

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

  const handleSignup = async() => {
    const validated = validateInputs();
    if (!validated) return;
    const { deleteUser } = await import('firebase/auth');
    try {
      await createUserWithEmailAndPassword(auth, values.username, values.password).then(async () => {
        const user = await auth.currentUser;
        if (user) {
          const { doc, setDoc } = await import('firebase/firestore')
          await setDoc(doc(db, 'users', user.uid), { email: values.username, createdAt: new Date() }).then(() => {
            console.log('Success', 'Your profile has been updated!')
          }).catch((error) => {
            deleteUser(user)
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

  const handleSignIn = async() => {
    console.log('HANDLE SIGN IN RAN');
    const validated = validateInputs();
    if (!validated) return;
    try {
      await signInWithEmailAndPassword(auth, values.username, values.password);
      await auth.currentUser.reload();
      const currentUser = auth.currentUser;
      console.log("From handleSignIn : user = ", currentUser);
      if (currentUser) {
        loginFn({ userObj: currentUser });
        console.log("SAVING CURRENT USER IN PROFILE .JS FILE")
        reset();
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
              Toast.show({
                type: 'info',
                text1: 'Verify Your Mobile Number!',
                text2: 'Please link your mobile number with your account.',
                position: 'top',
                topOffset: 100,
              });
              navigation.navigate('Auth', { screen: 'Phone Link' });
            }
            else {
              navigation.navigate('Home', { screen: 'Home Screen' })
            }
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
      logoImageSource={require('../../assets/logo2.png')}
      onLoginPress={handleSignup}
      onSignupPress={() => { setEnableSignUp({ value: false, from: "sign up button press" }) }}
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
        </View >
      }
      onPasswordChange={handleChange.bind(this, 'password')}
    />
  )

  const renderLoginScreen = () => (
    <LoginScreen
      logoImageSource={require('../../assets/logo2.png')}
      onLoginPress={handleSignIn}
      onSignupPress={() => setEnableSignUp({ value: true, from: "sign up button press" })}
      onEmailChange={handleChange.bind(this, 'username')}
      onPasswordChange={handleChange.bind(this, 'password')}
      emailTextInputProps={{
        autoComplete: "email",
        textContentType: "emailAddress",
        returnKeyType: "next",
        value: values['username']
      }}
      passwordTextInputProps={{
        autoComplete: "password",
        textContentType: "password",
        returnKeyType: "done",
        onFocus: handlePasswordFocus,
        value: values['password']
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
          {enableSignUp["value"] ? renderSignupLoginScreen() : renderLoginScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

export default ProfileScreen;


