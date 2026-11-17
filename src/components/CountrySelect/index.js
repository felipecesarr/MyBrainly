import React, { useContext } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { styles } from "./styles";
import { ProfileContext } from "../../contexts/ProfilesContext"; 

export default function CountrySelect({ abreDrawer }) {
  const { selectedProfile } = useContext(ProfileContext); 

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={abreDrawer}>
        <Image
          style={styles.imageFlag}
          source={{ uri: selectedProfile?.flagUrl }}
        />
      </TouchableOpacity>
    </View>
  );
}
