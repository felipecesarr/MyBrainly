import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Image, Pressable } from 'react-native';
import { styles } from './styles';
import { db } from '../../db/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../../contexts/AuthContext';
import { ProfileContext } from '../../contexts/ProfilesContext';

export default function CustomDecks({ modalVisible, setModalVisible, onSelectDeck }) {
  const [decks, setDecks] = useState([]);
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext); 

  useEffect(() => {
    if (user && selectedProfile) {
      const decksRef = collection(db, 'decks');
      const q = query(
        decksRef,
        where('userId', '==', user.uid),
        where('profileId', '==', selectedProfile.id)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userDecks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Inclui todos os campos do deck
          title: doc.data().name || doc.data().title,
          cover: doc.data().cover || 'https://example.invalid/mybrainly-demo/asset.png', // Substitua pelo link correto
        }));

        // Adiciona o deck 'Geral' manualmente
        const generalDeck = {
          id: 'NuLCnQtWeMsDkgLNy1cY',
          title: 'Geral',
          cover: "https://example.invalid/mybrainly-demo/asset.png", // Substitua pelo link correto
          userId: user.uid,
          profileId: selectedProfile.id,
          isGeneral: true, // Adiciona um indicador para o deck Geral
          stats: {
            totalCards: 0,
            studiedCards: 0,
            cardsWithHighRetention: 0,
            lastStudyDate: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          retentionRate: 0,
          description: 'Deck geral para todos os flashcards',
          cardCount: 0,
          dailyActivity: {},
        };

        // Combina o deck Geral com os decks do usuário
        const allDecks = [generalDeck, ...userDecks];

        setDecks(allDecks);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user.uid, selectedProfile.id]);

  return (
    <Modal visible={modalVisible} transparent={true} animationType="slide">
      <Pressable style={styles.container} onPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={decks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => {
                  onSelectDeck(item); // Passa o objeto completo do deck
                  setModalVisible(false); // Fechar o modal após a seleção
                }}
              >
                <Image source={{ uri: item.cover }} style={styles.flag} />
                <Text numberOfLines={1} style={styles.languageText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}
