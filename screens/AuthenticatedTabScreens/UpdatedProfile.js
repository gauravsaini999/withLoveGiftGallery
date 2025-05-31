import React, { useState, useEffect, startTransition } from 'react';
import { Modal, TouchableWithoutFeedback, ScrollView, StyleSheet, Alert, TouchableOpacity, View, Platform } from 'react-native';
import { Input, Button, Avatar, Text, ButtonGroup } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { signOut } from 'firebase/auth';
import IntraScreenBackButton from '../../components/IntraScreenBackButton';
import { useNavigationHistory } from '../../zustand/useNavigationHistory';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { CLOUD_NAME } from '@env';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalLoader from '../../components/ModalLoader';

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
  const genderOptions = ['Male', 'Female', 'Other']; // options for gender selection
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bday, setBday] = useState(profile.birthday ? new Date(profile.birthday) : new Date());
  const [selectedIndex, setSelectedIndex] = useState(profile.gender ? genderOptions.indexOf(profile.gender) : null);
  const [image, setImage] = useState(profile.imageUrl || '');
  const [showComponentTransitioning, setShowComponentTransitioning] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false); // show date time picker
  const [loading, setLoading] = useState(false);
  const { auth, db } = useFirebaseInit();
  const navigation = useNavigation();
  const { history, push, reset } = useNavigationHistory();
  const { userObj, logoutFn } = useAuthenticationStateSlice();
  const [isEditing, setIsEditing] = useState(false); // Edit Mode On / Off

  const onChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // On iOS, keep picker open until user closes
    if (selectedDate) {
      setBday(selectedDate);
    }
  };

  // useEffect(() => {
  //   const getDb = async () => {
  //     const { getFirestore } = await import('firebase/firestore');
  //     try {
  //       const db_ = getFirestore(app);
  //       if (db_) {
  //         setDb(db_)
  //       }
  //     }
  //     catch (err) {
  //       console.log("Error while getting db instance: ", err);
  //     }
  //   }
  //   if (Object.keys(app).length) {
  //     getDb();
  //   }
  // }, [app])

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerTitle: 'Edit Profile',
        headerLeft: () => <IntraScreenBackButton />,
        headerRight: () => (<TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
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
    reset();
    push('Edit Profile');
  }, []);

  const uploadImageToCloudinary = async (photoUri) => {
    const data = new FormData();
    data.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', 'user_uploads_unsigned');

    try {
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
    console.log(result, 'result .....')
    if (!result?.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleProfileImageUpload = async (photoUri) => {
    try {
      const uploadedUrl = await uploadImageToCloudinary(photoUri);
      console.log('Profile image uploaded and URL saved!');
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
      if (!uploadedUrl.toString().trim() ||
        !name.trim() ||
        !email.trim() ||
        !location.trim() ||
        !bday.toISOString().trim() ||
        selectedIndex === null ||
        !genderOptions[selectedIndex]) {
        Alert.alert('Incomplete Form', 'Please fill all fields.');
        return;
      }
      const user = userObj; //auth?.currentUser;
      if (!user) {
        Alert.alert('Not Logged In', 'You must be signed in to complete your profile.');
        return;
      }
      const { doc, setDoc } = await import('firebase/firestore');
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ModalLoader visible={showComponentTransitioning} />
      <Text h3 style={styles.header}>Profile Details</Text>
      <Avatar
        rounded
        size="xlarge"
        icon={{ name: 'user', type: 'font-awesome' }}
        source={image ? { uri: image } : null}
        containerStyle={styles.avatar}
      >
        {isEditing && <Avatar.Accessory size={30} onPress={handleChoosePhoto} />}
      </Avatar>

      {isEditing ? (
        <>
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            leftIcon={{ type: 'feather', name: 'user' }}
          />
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            leftIcon={{ type: 'feather', name: 'mail' }}
          />
          <Input
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            leftIcon={{ type: 'feather', name: 'map-pin' }}
          />
        </>
      ) : (
        <View style={styles.container_}>
          <Text style={[styles.label]}>Full Name</Text>
          <Text>{name}</Text>
          <Text style={[styles.label, { marginTop: 20 }]}>Email</Text>
          <Text>{email}</Text>
          <Text style={[styles.label, { marginTop: 20 }]}>Location</Text>
          <Text>{location}</Text>
        </View>
      )}

      <View style={styles.container_}>
        <Text style={styles.label}>Birthday</Text>
        {isEditing ? (
          <>
            <Button
              title={bday.toDateString()}
              type="outline"
              onPress={() => setShowDatePicker(true)}
              buttonStyle={styles.button_}
              titleStyle={styles.buttonTitle}
            />
            <DateTimePickerCustomized
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              bday={bday}
              onChange={onChange}
            />
          </>
        ) : (
          <Text>{bday.toDateString()}</Text>
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Gender</Text>
        {isEditing ? (
          <>
            <ButtonGroup
              onPress={setSelectedIndex}
              selectedIndex={selectedIndex}
              buttons={genderOptions}
              containerStyle={styles.buttonGroup}
              selectedButtonStyle={styles.selectedButton}
              textStyle={styles.buttonGroupText}
            />
            <Text style={styles.selectedText}>
              Selected: {selectedIndex !== null ? genderOptions[selectedIndex] : 'None'}
            </Text>
          </>
        ) : (
          <Text>{selectedIndex !== null ? genderOptions[selectedIndex] : 'None'}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', alignItems: 'center' }}>
        <Button
          title={isEditing ? 'Cancel' : 'Edit Profile'}
          onPress={() => setIsEditing(prev => !prev)}
          buttonStyle={styles.button}
        />

        {isEditing &&
          <>
            <ModalLoader visible={loading} />
            <Button
              title="Save Profile"
              onPress={handleSaveProfile}
              buttonStyle={styles.button}
              disabled={loading}
              disabledStyle={{ opacity: 0.5 }}
            />
          </>
        }
      </View>
    </ScrollView>
  )
}

export default UpdatedProfile

const styles = StyleSheet.create({
  TextContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#f7f9fc',
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f7f9fc',
    flexGrow: 1,
    alignItems: 'flex-start',
  },
  header: {
    marginBottom: 30,
    alignSelf: 'center'
  },
  avatar: {
    marginBottom: 20,
    backgroundColor: '#ddd',
    alignSelf: 'center'
  },
  button: {
    backgroundColor: '#2089dc',
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 20,
  },
  container_: {
    marginVertical: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  button_: {
    borderColor: '#2089dc',
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonTitle: {
    color: '#2089dc',
    fontSize: 16,
  },
  datePicker: {
    width: '100%',
    marginTop: 10,
  },
  buttonGroup: {
    borderRadius: 8,
    marginLeft: 0,
    width: '100%',
  },
  selectedButton: {
    backgroundColor: '#2089dc',
  },
  buttonGroupText: {
    fontSize: 15,
    color: '#2089dc',
  },
  selectedText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
});