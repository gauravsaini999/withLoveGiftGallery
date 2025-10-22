import { useState, useEffect, startTransition } from 'react';
import EnterProfileDetailsForm from './EditProfile';
import ViewOrEditProfileForm from './UpdatedProfile';
import { useAuthenticationStateSlice } from '../../zustand/useAuthenticationStateSlice';
import { useFirebaseInit } from '../../zustand/useFirebaseInit';
import ModalLoader from '../../components/ModalLoader';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreenDecider = () => {
  const { userObj: user } = useAuthenticationStateSlice();
  const { db } = useFirebaseInit();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        if (user) {
          const profileRef = doc(db, 'users', user.uid); // adjust path if needed
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        }
      }
      catch (err) {
        console.log("Error = ", err);
      }
      finally {
        startTransition(() => {
          setLoading(false);
        })
      }
    };
    fetchUserAndProfile();
  }, [user, db]);

  if (loading) {
    return <ModalLoader visible={loading} />
  }
  
  return <ViewOrEditProfileForm profile={profile} />

}

export default ProfileScreenDecider;
