import { useRef, useState, startTransition } from 'react';
import { ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import LoginScreen from "react-native-login-screen";
import Toast from 'react-native-toast-message';
import ModalLoader from '../../components/ModalLoader';

export default function LinkPhone({ navigation }) {
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { auth } = useFirebaseInit();

  const sendOtp = async () => {
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
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send OTP',
        text2: err.message,
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      })
    }
  };

  const linkPhoneNumber = async () => {
    try {
      startTransition(() => {
        setLoading(true);
      })
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await linkWithCredential(auth.currentUser, credential);
      Toast.show({
        type: 'success',
        text1: 'Phone Linked!',
      });
      navigation.goBack(); // or navigate elsewhere
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Linking failed',
        text2: err.message,
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      })
    }
  };

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
            firebaseConfig={auth.app.options}
          />
          <LoginScreen
            disableDivider
            disableSocialButtons
            disableForgotPassword
            disableSignup
            logoImageSource={require('../../assets/logo2.png')}
            onLoginPress={verificationId ? linkPhoneNumber : sendOtp}
            loginButtonText={verificationId ? 'Confirm & Link Phone' : 'Send OTP'}
            onEmailChange={setPhoneNumber}
            onPasswordChange={setOtp}
            emailPlaceholder="Phone Number (e.g. +1234567890)"
            passwordPlaceholder="OTP"
            enablePasswordValidation={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
