import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Circle } from 'react-native-progress'; // Adicione esta importação
import { db } from '../../db/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ModalMyDecks from '../ModalMyDecks';
import { styles } from './styles';

export default function FolderMyDeck({ data }) {
  const [modalDetailDeck, setModalDetailDeck] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const [cardCount, setCardCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [retentionRate, setRetentionRate] = useState(0); // Estado para taxa de retenção

  // Função para buscar o nome do usuário
  async function fetchUserName(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data().userName);
      } else {
        void 0;
      }
    } catch (error) {
      void 0;
    }
  }

  // Função para contar flashcards no deck e calcular taxa de retenção média
  async function fetchCardData() {
    setIsLoading(true);
    try {
      // Consulta para flashcards associados a este deck
      const q = query(
        collection(db, "flashcards"), 
        where("deckId", "==", data.id)
      );
      
      // Executa a consulta
      const querySnapshot = await getDocs(q);
      
      // Atualiza a contagem
      setCardCount(querySnapshot.size);
      
      // Calcula a taxa de retenção média
      if (querySnapshot.size > 0) {
        let totalRetention = 0;
        let cardsWithStats = 0;
        
        querySnapshot.forEach((doc) => {
          const flashcard = doc.data();
          if (flashcard.stats && flashcard.stats.retention !== undefined) {
            totalRetention += flashcard.stats.retention;
            cardsWithStats++;
          }
        });
        
        // Calcula a média apenas para cards que têm estatísticas
        const avgRetention = cardsWithStats > 0 ? totalRetention / cardsWithStats : 0;
        setRetentionRate(Math.round(avgRetention));
      } else {
        setRetentionRate(0);
      }
    } catch (error) {
      void 0;
      setCardCount(data.cardCount || 0);
      setRetentionRate(0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (data.userId) {
      fetchUserName(data.userId);
    }
    
    // Busca a contagem de flashcards e dados de retenção
    fetchCardData();
  }, [data.userId, data.id]);

  function closeModal() {
    setModalDetailDeck(false);
    // Definir loading para true ANTES de buscar os dados
    setIsLoading(true); 
    // Pequeno timeout para dar tempo à animação de fechamento do modal
    setTimeout(() => {
      fetchCardData();
    }, 100);
  }
  
  // Determina a cor baseada no nível de retenção
  const getRetentionColor = (retention) => {
    if (retention >= 80) return '#56cbb9'; // Verde pastel
    if (retention >= 50) return '#71aff6'; // Azul pastel
    return '#ef6283'; // Vermelho pastel
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  const retentionColor = getRetentionColor(retentionRate);

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => setModalDetailDeck(true)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Animatable.View 
        animation="fadeIn" 
        duration={500} 
        style={[styles.container, isPressed && styles.containerPressed]}
      >
        {/* Imagem com gradiente */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: data.cover }} 
            style={styles.image} 
            resizeMode="cover" 
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          
          
          {/* Contador de cards com estado de carregamento */}
          <View style={styles.cardCounter}>
            <Ionicons name="copy-outline" size={13} color="#FFF" />
            <Text style={styles.cardCountText}>
              {isLoading ? "..." : cardCount}
            </Text>
          </View>
          
          {/* NOVO: Indicador de retenção circular */}
          <View style={styles.retentionCircleContainer}>
            <View style={styles.retentionCircleBackground}>
              {isLoading ? (
                <Circle color={'#CB48DF'} size={36} />
              ) : (
                <>
                  <Circle 
                    key={`circle-${retentionRate}`} // Adicionar key dinâmica
                    size={36}
                    thickness={4}
                    color={retentionColor}
                    unfilledColor='white'
                    borderWidth={0}
                    progress={retentionRate / 100}
                    strokeCap="round"
                    direction="clockwise"
                    animated={true} // Garantir que a animação está ativada
                    animationConfig={{ duration: 500 }} // Controlar duração da animação
                  />
                  <Text style={styles.retentionText}>
                    {retentionRate}%
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Informações do deck */}
        <View style={styles.infoContainer}>
          <Text style={styles.deckName}>
            {truncateText(data.name, 18)}
          </Text>
          
          <View style={styles.creatorContainer}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorInitial}>
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.creatorName}>
              {truncateText(userName, 12)}
            </Text>
          </View>
        </View>
      </Animatable.View>

      {/* Modal de detalhes */}
      {modalDetailDeck && (
        <ModalMyDecks fechar={closeModal} deckId={data.id} />
      )}
    </TouchableOpacity>
  );
}