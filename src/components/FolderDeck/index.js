import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../db/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ModalAboutDeck from '../ModalAboutDeck';
import { styles } from './styles';

export default function FolderDeck({ data }) {
  const [modalDetailDeck, setModalDetailDeck] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const [cardCount, setCardCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  // Função para contar flashcards no deck
  async function fetchCardCount() {
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
    } catch (error) {
      void 0;
      // Em caso de erro, usamos o valor padrão ou o valor já existente
      setCardCount(data.cardCount || 0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (data.userId) {
      fetchUserName(data.userId);
    }
    
    // Busca a contagem de flashcards
    fetchCardCount();
  }, [data.userId, data.id]);

  function closeModal() {
    setModalDetailDeck(false);
    // Atualiza a contagem ao fechar o modal (caso flashcards tenham sido adicionados/removidos)
    fetchCardCount();
  }

  // Função para truncar texto longo
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  // Para determinar a cor do ícone baseado na categoria ou tema do deck
  const getThemeIcon = () => {
    // Mapeamento completo de IDs numéricos para categorias textuais
    const themeToCategory = {
      '1': 'entretenimento',  // Filmes & Séries
      '2': 'comida',          // Gastronomia 
      '3': 'compras',         // Supermercado
      '4': 'idiomas',         // Idiomas
      '5': 'viagem',          // Viagens & Turismo
      '6': 'negócios',        // Negócios & Trabalho
      '7': 'tecnologia',      // Tecnologia
      '8': 'educação',        // Educação
      '9': 'esportes',        // Esportes
      '10': 'médico',         // Saúde & Bem-estar
      '11': 'arte',           // Artes & Cultura
      '12': 'ciências',       // Ciências
      '13': 'história',       // História
      '14': 'matemática',     // Matemática
      '15': 'música',         // Música
      '16': 'literatura',     // Literatura
      '17': 'geografia',      // Geografia
      '18': 'direito',        // Direito
      '19': 'economia',       // Economia
      '20': 'religião',       // Religião
      '21': 'filosofia',      // Filosofia
      '22': 'psicologia',     // Psicologia
      '23': 'culinária',      // Culinária
      '24': 'ecologia',       // Meio Ambiente
      '25': 'moda',           // Moda & Beleza
    };
  
    // Definição dos ícones e cores para cada categoria
    const themes = {
      'entretenimento': { icon: 'film', color: '#4A90E2' },
      'comida': { icon: 'restaurant', color: '#50E3C2' },
      'compras': { icon: 'cart', color: '#F5A623' },
      'idiomas': { icon: 'chatbubbles', color: '#9B9B9B' },
      'viagem': { icon: 'airplane', color: '#4A90E2' },
      'negócios': { icon: 'briefcase', color: '#9013FE' },
      'tecnologia': { icon: 'hardware-chip', color: '#F5A623' },
      'educação': { icon: 'school', color: '#7ED321' },
      'esportes': { icon: 'football', color: '#D0021B' },
      'médico': { icon: 'medkit', color: '#D0021B' },
      'arte': { icon: 'color-palette', color: '#BD10E0' },
      'ciências': { icon: 'flask', color: '#4A90E2' },
      'história': { icon: 'time', color: '#8B572A' },
      'matemática': { icon: 'calculator', color: '#4A90E2' },
      'música': { icon: 'musical-notes', color: '#F8E71C' },
      'literatura': { icon: 'book', color: '#9013FE' },
      'geografia': { icon: 'earth', color: '#7ED321' },
      'direito': { icon: 'shield', color: '#4A90E2' },
      'economia': { icon: 'cash', color: '#50E3C2' },
      'religião': { icon: 'infinite', color: '#9013FE' },
      'filosofia': { icon: 'thunderstorm', color: '#4A90E2' },
      'psicologia': { icon: 'fitness', color: '#D0021B' },
      'culinária': { icon: 'fast-food', color: '#F5A623' },
      'ecologia': { icon: 'leaf', color: '#7ED321' },
      'moda': { icon: 'shirt', color: '#BD10E0' },
      'geral': { icon: 'grid', color: '#CB48DF' }
    };
    
    // Lógica para determinar a categoria
    let category;
    
    // Verificar se data.category já existe diretamente
    if (data.category) {
      category = data.category.toLowerCase();
    } 
    // Caso contrário, tentar mapear do theme
    else if (data.theme) {
      category = themeToCategory[data.theme] || 'geral';
    } 
    // Fallback para 'geral'
    else {
      category = 'geral';
    }
    
    // Retorna o ícone e cor apropriados ou o default
    return themes[category] || themes['geral'];
  };

  const { icon, color } = getThemeIcon();

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
          
          {/* Ícone temático */}
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={18} color="#FFF" />
          </View>
          
          {/* Contador de cards com estado de carregamento */}
          <View style={styles.cardCounter}>
            <Ionicons name="copy-outline" size={13} color="#FFF" />
            <Text style={styles.cardCountText}>
              {isLoading ? "..." : cardCount}
            </Text>
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

      {/* Modal de detalhes - mantendo o mesmo modal específico deste componente */}
      {modalDetailDeck && (
        <Modal
          animationType="none"
          transparent={true}
          visible={modalDetailDeck}
          onRequestClose={closeModal}
        >
          <ModalAboutDeck fechar={closeModal} deckId={data.id} />
        </Modal>
      )}
    </TouchableOpacity>
  );
}