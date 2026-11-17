import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';
import CustomPicker from '../CustomPicker';
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { ProfileContext } from '../../contexts/ProfilesContext';
import { AuthContext } from '../../contexts/AuthContext';

export default function CustomDrawer(props) {
  const { profiles, selectProfile, selectedProfile } = useContext(ProfileContext);
  const { user, signOut } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectLanguage = (language) => {
    selectProfile(language.id);
    setModalVisible(false);
  };
  async function logOut(){
    await signOut();
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContainer}>
        <TouchableOpacity style={styles.pickerContainer} onPress={() => setModalVisible(true)}>
          {selectedProfile && (
            <>
              <Image source={{ uri: selectedProfile.flagUrl }} style={styles.avatar} />
              <Text style={styles.languageText}>{selectedProfile.language}</Text>
            </>
          )}
          <AntDesign name="down" size={16} color="#545454" />
        </TouchableOpacity>
        <CustomPicker 
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onSelectLanguage={handleSelectLanguage}
        />
      </View>
      <Text 
      numberOfLines={1}
      style={{
        margin: 12,
        fontSize: 16,
        color: '#545454',
        fontWeight: '500'
      }}>Olá, {user.userName}! 😆 </Text>
      <DrawerItemList {...props}/>
      <TouchableOpacity style={styles.logOutButton} onPress={logOut}>
         <SimpleLineIcons name="logout" size={20} color="#cb48df" />
        <Text
         style={{
          margin: 12,
          fontSize: 16,
          color: '#cb48df',
          fontWeight: '500'
        }}
        >Sair</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}
