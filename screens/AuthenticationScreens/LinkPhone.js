import { useRef, useState, startTransition } from 'react';
import { ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Alert, Keyboard, StatusBar } from 'react-native';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import LoginScreen from "react-native-login-screen";
import Toast from 'react-native-toast-message';
import ModalLoader from '../../components/ModalLoader';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';

export default function LinkPhone({ navigation }) {
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { app, auth, db } = useFirebaseInit();
  const { userObj: user, setPhoneAuth } = useAuthenticationStateSlice();

  const sendOtp = async () => {
    const { PhoneAuthProvider } = await import('firebase/auth');
    try {
      startTransition(() => {
        setLoading(true);
      })
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier.current);
      setVerificationId(id);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your phone.',
        position: 'top',
        topOffset: 100,
        autoHide: false,
        onPress: () => Toast.hide(),
        props: { fontSize: 25, fontFamily: 'ComicSansMS' }
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send OTP',
        text2: err.message,
        position: 'top',
        topOffset: 100,
        autoHide: false,
        onPress: () => Toast.hide(),
        props: { fontSize: 25, fontFamily: 'ComicSansMS' }
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      })
    }
  };

  const linkPhoneNumber = async () => {
    const { PhoneAuthProvider, linkWithCredential, deleteUser } = await import('firebase/auth');
    try {
      startTransition(() => {
        setLoading(true);
      })
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await linkWithCredential(auth.currentUser, credential).then(async () => {
        await addFlagToUserDb().then(() => {
          Toast.show({
            type: 'success',
            text1: 'Phone Linked!',
            position: 'top',
            topOffset: 100,
            autoHide: false,
            onPress: () => Toast.hide(),
            props: { fontSize: 25, fontFamily: 'ComicSansMS' }
          });
        }).catch(async (err) => {
          console.log(err, 'error in updating db so deleting the user thus created !!')
          await deleteUser(user)
            .then(() => {
              console.log('User deleted');
            })
            .catch((err) => {
              console.error('Error deleting user:', err);
            });
        });

      })

    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Linking failed',
        text2: err.message,
        position: 'top',
        topOffset: 100,
        autoHide: false,
        onPress: () => Toast.hide(),
        props: { fontSize: 25, fontFamily: 'ComicSansMS' }
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      })
    }
  };

  const addFlagToUserDb = async () => {
    const { doc, setDoc } = await import('firebase/firestore');
    const { deleteUser } = await import('firebase/auth');
    try {
      await setDoc(doc(db, 'users', user.uid), { phoneLinked: true }).then(() => {
        Toast.show({
          type: 'success',
          text1: 'Flag Set!',
          position: 'top',
          topOffset: 100,
          autoHide: false,
          onPress: () => Toast.hide(),
          props: { fontSize: 25, fontFamily: 'ComicSansMS' }
        });
        setPhoneAuth(true);
        navigation.navigate('Home', { screen: 'Home Screen' }); // or navigate elsewhere
      }).catch(async (err) => {
        Alert.alert('Error', 'Unable to set flag in Db!', err);
        await deleteUser(user)
          .then(() => {
            console.log('User deleted');
          })
          .catch((err) => {
            console.error('Error deleting user:', err);
          });
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Setting Flag to DB Failed',
        text2: err.message,
        position: 'top',
        topOffset: 100,
        autoHide: false,
        onPress: () => Toast.hide(),
        props: { fontSize: 25, fontFamily: 'ComicSansMS' }
      });
      await deleteUser(user)
        .then(() => {
          console.log('User deleted');
        })
        .catch((err) => {
          console.error('Error deleting user:', err);
        });
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
          <StatusBar barStyle="light-content" />
          <ModalLoader visible={loading} />
          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={app.options}
          />
          <LoginScreen
            disableDivider
            disableSocialButtons
            disableForgotPassword
            onSignupPress={() => sendOtp()}
            signupText='Resend OTP'
            logoImageSource={require('../../assets/logo2.png')}
            onLoginPress={verificationId ? linkPhoneNumber : sendOtp}
            loginButtonText={verificationId ? 'Confirm & Link Phone' : 'Send OTP'}
            onEmailChange={setPhoneNumber}
            onPasswordChange={setOtp}
            emailPlaceholder="Phone Number (e.g. +1234567890)"
            passwordPlaceholder="OTP"
            enablePasswordValidation={false}
            disableEmailValidation
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
