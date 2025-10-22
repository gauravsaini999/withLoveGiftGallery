import React, { useState, useEffect, startTransition } from 'react';
import { Modal, TouchableWithoutFeedback, ScrollView, StyleSheet, Alert, TouchableOpacity, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { signOut } from 'firebase/auth';
import IntraScreenBackButton from '../../components/IntraScreenBackButton';
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { CLOUD_NAME } from '@env';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalLoader from '../../components/ModalLoader';
import * as Location from 'expo-location';
import { doc, setDoc } from 'firebase/firestore';

import {
  Avatar,
  Button,
  Text,
  TextInput,
  RadioButton,
  Divider,
  Surface,
  useTheme,
  List,
  IconButton
} from 'react-native-paper';
import { colors } from '../../shared/colors'

const fakeApiCall = () => new Promise((resolve) => setTimeout(resolve, 500));

const DateTimePickerCustomized = ({ showDatePicker, setShowDatePicker, bday, onChange }) => {
  return (
    <Modal
      transparent={true}
      visible={showDatePicker}
      animationType="fade"
      onRequestClose={() => setShowDatePicker(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback>
            <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
              <DateTimePicker
                value={bday}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={onChange}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
};

const UpdatedProfile = ({ profile }) => {
  const theme = useTheme();
  const genderOptions = ['Male', 'Female', 'Other']; // options for gender selection
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [coords, setCoords] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [bday, setBday] = useState(profile?.birthday ? new Date(profile?.birthday) : new Date());
  const [selectedIndex, setSelectedIndex] = useState(profile?.gender ? genderOptions.indexOf(profile?.gender) : null);
  const [image, setImage] = useState(profile?.imageUrl || '');
  const [showComponentTransitioning, setShowComponentTransitioning] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false); // show date time picker
  const [loading, setLoading] = useState(false);
  const { auth, db } = useFirebaseInit();
  const navigation = useNavigation();
  const { history, push, reset } = useNavigationHistory();
  const { userObj: user, logoutFn } = useAuthenticationStateSlice();
  const [isEditing, setIsEditing] = useState(false); // 

  const handleDetectLocation = async () => {
    try {
      setDetectingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setDetectingLocation(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const [geo] = await Location.reverseGeocodeAsync(position.coords);

      if (geo) {
        const city = geo.city || geo.subregion || '';
        const country = geo.country || '';
        setLocation(`${city}, ${country}`);
      } else {
        alert('Unable to detect location');
      }
    } catch (err) {
      alert('Error detecting location');
    } finally {
      setDetectingLocation(false);
    }
  };

  useEffect(() => {
    if (!location) {
      handleDetectLocation();
    }
  }, []);

  const onChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // On iOS, keep picker open until user closes
    if (selectedDate) {
      setBday(selectedDate);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerTitle: 'Edit Profile',
        headerLeft: () => <IntraScreenBackButton />,
        headerRight: () => (<TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <MaterialIcons name="logout" size={20} color="#333" style={{ marginRight: 10 }} />
        </TouchableOpacity>)
      })
    }, [navigation, history])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        logoutFn();
      }
    } catch (errMsg) {
      console.log('Error while signing out: ', errMsg);
    }
  };

  React.useLayoutEffect(() => {
    push('Edit Profile');
  }, []);

  const uploadImageToCloudinary = async (photoUri) => {
    try {
      const data = new FormData();
      data.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `${user.uid}`
      });
      data.append('upload_preset', 'user_uploads_unsigned');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      const optimizeUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/${json.public_id}.jpg`;
      const autoCropUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,g_auto,w_240,h_240/${json.public_id}.jpg`;

      console.log('Upload Success:', json.secure_url);
      console.log('Optimized URL:', optimizeUrl);
      console.log('Auto-Cropped URL:', autoCropUrl);

      return autoCropUrl; // return cropped version for avatar
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Upload failed', err.message);
      return null;
    }
  };

  const ensureMediaLibraryPermission = async () => {
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();

    let finalStatus = existingStatus;

    // If permission not granted, request it now
    if (existingStatus !== 'granted') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photos to upload a profile picture.'
      );
      return false;
    }

    return true;
  };

  const handleChoosePhoto = async () => {
    const hasPermission = await ensureMediaLibraryPermission();
    console.log(hasPermission, 'hasPermission')
    if (!hasPermission) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(status, 'status of permissions')
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result?.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleProfileImageUpload = async (photoUri) => {
    try {
      const uploadedUrl = await uploadImageToCloudinary(photoUri);
      console.log('Profile image uploaded and URL saved at !', uploadedUrl);
      return uploadedUrl;
    } catch (error) {
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
      return false;
    }
  };

  useEffect(() => {
    const wait2SecToShowLoader = async () => {
      startTransition(() => {
        setShowComponentTransitioning(true);
      })
      await fakeApiCall();
      startTransition(() => {
        setShowComponentTransitioning(false);
      })
    }
    if (isEditing) {
      wait2SecToShowLoader();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!profile || !profile?.name || !profile?.email) {
      setIsEditing(true);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    startTransition(() => {
      setLoading(true);
    })
    try {
      const uploadedUrl = await handleProfileImageUpload(image);
      const profileData = {
        name,
        email,
        location,
        birthday: bday.toISOString(),
        gender: genderOptions[selectedIndex] ?? null,
        imageUrl: uploadedUrl || '',
        completedAt: new Date().toISOString(),
      };
      if (!uploadedUrl || !name.trim() ||
        !email.trim() ||
        !location.trim() ||
        !bday.toISOString().trim() ||
        selectedIndex === null ||
        !genderOptions[selectedIndex]) {
        Alert.alert('Incomplete Form', 'Please fill all fields.');
        return;
      }
      if (!user) {
        Alert.alert('Not Logged In', 'You must be signed in to complete your profile.');
        return;
      }
      await setDoc(doc(db, 'users', user.uid), profileData);
      Alert.alert('Success', 'Your profile has been updated!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      startTransition(() => {
        setIsEditing(false);
        setLoading(false);
      })
    }
  };

  const gender = selectedIndex !== null ? genderOptions[selectedIndex] : 'Not specified';

  const genderIcon = (() => {
    switch (gender.toLowerCase()) {
      case 'male':
        return 'gender-male';
      case 'female':
        return 'gender-female';
      case 'non-binary':
        return 'gender-non-binary';
      default:
        return 'gender-male-female';
    }
  })();

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <ModalLoader visible={showComponentTransitioning} />

      <Text variant="headlineMedium" style={styles.header}>Profile Details</Text>
      <View style={styles.surroundingCircle}>
        <View style={styles.clippingCircle}>
          <View style={styles.avatarWrapper}>
            <Avatar.Image
              size={160}
              source={image ? { uri: image } : require('../../assets/default-avatar.png')}
              style={styles.avatar}
            />
          </View>
        </View>
      </View>
      {isEditing && (
        <Button mode="outlined" onPress={handleChoosePhoto} style={styles.photoButton}>
          Change Photo
        </Button>
      )}

      <Surface style={styles.infoCard}>
        {isEditing ? (
          <>
            <View style={{ marginBottom: 4 }}><Text variant="titleSmall" style={[styles.sectionTitle, { textAlign: 'center' }]}>Personal Info</Text></View>
            <View style={{ marginBottom: 8 }}><TextInput style={{ backgroundColor: colors.elevatedBox[2] }} label="Full Name" value={name} onChangeText={setName} mode="outlined" /></View>
            <View style={{ marginBottom: 8 }}><TextInput style={{ backgroundColor: colors.elevatedBox[2] }} label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" /></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                label="Location"
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                left={<TextInput.Icon icon="map-marker" />}
                style={{ flex: 1, backgroundColor: colors.elevatedBox[2] }}
              />
              <IconButton
                icon="crosshairs-gps"
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                loading={detectingLocation}
                accessibilityLabel="Detect Location"
              />
            </View>
          </>
        ) : (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>Personal Info</Text>
            <List.Item
              title={name}
              description="Full Name"
              left={props => <List.Icon {...props} icon="account" />}
            />
            <List.Item
              title={email}
              description="Email"
              left={props => <List.Icon {...props} icon="email" />}
            />
            <List.Item
              title={location}
              description="Location"
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
          </>
        )}
      </Surface>

      <Surface style={styles.infoCard}>
        <List.Item
          title={bday.toDateString()}
          description="Birthday"
          left={props => <List.Icon {...props} icon="cake" />}
        />
        {isEditing && (
          <>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              Choose Birthday
            </Button>
            <DateTimePickerCustomized
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              bday={bday}
              onChange={onChange}
            />
          </>
        )}

        <Divider style={{ marginVertical: 10 }} />
        <List.Item
          title={genderOptions[selectedIndex] ?? 'Not specified'}
          description="Gender"
          left={props => <List.Icon {...props} icon={genderIcon} />}
        />

        {isEditing && (
          <RadioButton.Group
            onValueChange={(val) => setSelectedIndex(genderOptions.indexOf(val))}
            value={genderOptions[selectedIndex] || ''}
          >
            {genderOptions.map((option, idx) => (
              <RadioButton.Item key={idx} label={option} value={option} />
            ))}
          </RadioButton.Group>
        )}
      </Surface>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => setIsEditing(prev => !prev)}
          style={styles.actionButton}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
        {isEditing && (
          <>
            <ModalLoader visible={loading} />
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              disabled={loading}
              style={styles.actionButton}
            >
              Save Profile
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.contentColor,
    flexGrow: 1,
  },
  header: {
    alignSelf: 'center',
    marginBottom: 20,
    color: colors.elevatedBox[2]
  },
  avatarWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  surroundingCircle: {
    alignSelf: 'center',
    width: 185, // 120 (avatar) + 2*5 (ring thickness)
    height: 185,
    borderRadius: 92.5, // half of width/height
    backgroundColor: colors.elevatedBox[2], // ring color
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  clippingCircle: {
    alignSelf: 'center',
    width: 180, // 120 (avatar) + 2*5 (ring thickness)
    height: 180,
    borderRadius: 90, // half of width/height
    backgroundColor: colors.contentColor, // ring color
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  photoButton: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: colors.elevatedBox[2]
  },
  section: {
    padding: 20,
    borderRadius: 10,
    elevation: 1,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#555',
  },
  dateButton: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  infoCard: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.elevatedBox[2],
    borderRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },

  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2089dc',
    marginBottom: 10,
  },
});

export default UpdatedProfile;