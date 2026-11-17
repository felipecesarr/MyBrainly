import React, { createContext, useState, useEffect } from "react";
import { db } from "../../db/config";
import { collection, getDocs } from "firebase/firestore"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ProfileContext = createContext();

export default function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const defaultProfile = {
    id: "drrr7RMMHiyKVlIJgkwH",
    language: "Inglês",
    flagUrl: "https://example.invalid/mybrainly-demo/asset.png", // Substitua pelo link correto
  };

  useEffect(() => {
    async function loadProfiles() {
      try {
        const profilesSnapshot = await getDocs(collection(db, "profiles"));
        const profilesArray = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProfiles(profilesArray);

        const storedProfile = await AsyncStorage.getItem('@selectedProfile');
        if (storedProfile) {
          setSelectedProfile(JSON.parse(storedProfile));
        } else {
          setSelectedProfile(defaultProfile);
          await AsyncStorage.setItem('@selectedProfile', JSON.stringify(defaultProfile));
        }
      } catch (error) {
        void 0;
      }
    }

    loadProfiles();
  }, []);

  async function selectProfile(profileId) {
    const profile = profiles.find(p => p.id === profileId);
    setSelectedProfile(profile);
    await AsyncStorage.setItem('@selectedProfile', JSON.stringify(profile));
  }

  return (
    <ProfileContext.Provider value={{ profiles, selectedProfile, selectProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
