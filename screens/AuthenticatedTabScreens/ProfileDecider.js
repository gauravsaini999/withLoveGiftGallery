import { useState, useEffect } from 'react';
import EnterProfileDetailsForm from './EditProfile';
import ViewOrEditProfileForm from './UpdatedProfile';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import { ActivityIndicator } from 'react-native';

const ProfileScreenDecider = () => {
  const { userObj: user } = useAuthenticationStateSlice();
  const { db, app, setDb } = useFirebaseInit();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        if (user) {
          const profileRef = doc(db, 'users', user.uid); // adjust path if needed
          console.log(profileRef, '<<<<<<<<< reference to collection >>>>>>>>')
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        }
        setLoading(false);
      }
      catch (err) {
        console.log("Error = ", err);
      }
    };
    fetchUserAndProfile();
  }, [user, db]);

  if (loading) {
    return <ActivityIndicator size="large" color="#2089dc" />;
  }

  if (!profile || !profile.name || !profile.email) {
    // User has no profile or incomplete profile — show full input form
    return <EnterProfileDetailsForm />;
  } else {
    // User has profile — show view/edit profile screen
    return <ViewOrEditProfileForm profile={profile} />;
  }
};

export default ProfileScreenDecider;
