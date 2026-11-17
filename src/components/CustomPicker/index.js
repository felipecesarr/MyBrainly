import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { styles } from './styles';
import { ProfileContext } from '../../contexts/ProfilesContext';

export default function CustomPicker({ modalVisible, setModalVisible, onSelectLanguage }) {
  const { profiles } = useContext(ProfileContext);
  const customOrder = [
    'drrr7RMMHiyKVlIJgkwH',
    'Pwe2liNO7twwjpmHHauq',
    'CdTFioDkyR1J7uYQpFjp', 
    'ezWcQR6HMRr422AaJoID', 
    'qWxR35mfCZPdME4D257G',
    'JGO1gVHX0Jsr2KIA5gF6',
    'NPbAta0YwDStM2vAmdjs',
    'Sem8wSJxO6HLdaXXq0NM',
    'EUZo8Tf6SFuS4fw4cKbM',
    '9vI6N7kABdwUHe4InizH',
    '2cnBDw8mb1fCOrnhO1y7',
    '4U3KmdGB2xUJzeTzMC7Y',
    '528YOEo78RDejsFlE7yt',
    'IvUZ0amJmlJJu3jcFQhz',
    'UdSZBgeB7KZXPwgElR6Q',
    'doIrPWh7ptNXV9c903zQ',
    'LOsfm3p9rxfe6KlpHJf0',
  ];
  const sortedProfiles = profiles.sort((a, b) => customOrder.indexOf(a.id) - customOrder.indexOf(b.id));
  return (
    <Modal visible={modalVisible} transparent={true} animationType="slide">
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={profiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => onSelectLanguage(item)}
              >
                <Image 
                  source={{ uri: item.flagUrl }} 
                  style={styles.flag} 
                  onError={() => Alert.alert("Erro", "A imagem da bandeira não pôde ser carregada.")} 
                />
                <Text style={styles.languageText}>{item.language}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
