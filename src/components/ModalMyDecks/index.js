import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, Image, Share, Alert, ActivityIndicator, Modal, TouchableWithoutFeedback, Pressable } from "react-native";
import { db } from "../../db/config";
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";
import ListWords from "../ListWords";
import ModalAddFlashcard from "../ModalAddFlashcard";
import { styles } from "./styles";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons, Fontisto, Feather, EvilIcons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import ModalDetail from "../ModalDetail";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from 'react-native-animatable';

export default function ModalMyDecks({ fechar, deckId, onEdit }) {
  const navigation = useNavigation();
  const [deckData, setDeckData] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddFlashcardVisible, setIsAddFlashcardVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const [modalDetails, setModalDetails] = useState(false);
  const [flashcardToEdit, setFlashcardToEdit] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Conteúdo dos tooltips
  // Conteúdo dos tooltips aprimorado
const tooltipContents = {
  general: {
    title: "Como funciona? 🧠",
    description: "Essas métricas mostram seu progresso rumo à fluência! O MyBrainly tem 8 níveis de proficiência (de Iniciante a Nativo), e você avança acumulando flashcards com alta retenção. Acompanhe essas estatísticas para melhorar seu aprendizado!",
    icon: "brain",
    color: "#F8D2FF" // Tom pastel de roxo
  },
  totalCards: {
    title: "Total de Cards 📚",
    description: "Quanto mais flashcards você criar, mais oportunidades terá de dominar o vocabulário. Para alcançar níveis avançados como Proficiente (nível 7) e Nativo (nível 8), você precisará de milhares de cards com alta retenção.",
    icon: "cards-outline",
    color: "#D2E9FF" // Tom pastel de azul
  },
  studiedCards: {
    title: "Cards Estudados 👀",
    description: "São os flashcards que você já revisou pelo menos uma vez. Este é o primeiro passo para atingir alta retenção! Para um card contar para seu nível de proficiência, ele precisa ter no mínimo 5 tentativas de estudo.",
    icon: "eye-check-outline",
    color: "#D2FFE8" // Tom pastel de verde
  },
  highRetention: {
    title: "Alta Retenção 🧠",
    description: "Cards com pelo menos 5 tentativas e 80% ou mais de acertos. São ESTES cards que determinam seu nível de proficiência! Você precisa de 15.000+ cards com alta retenção para atingir o nível Nativo (nível 8).",
    icon: "brain",
    color: "#FFECD2" // Tom pastel de laranja
  },
  overallRetention: {
    title: "Retenção Geral 📊",
    description: "É sua taxa média de acertos. Manter acima de 80% acelera seu progresso, pois mais cards atingirão alta retenção. Esta métrica é um indicador-chave da eficácia do seu método de estudo.",
    icon: "chart-line",
    color: "#FFD2D2" // Tom pastel de vermelho
  },
  progress: {
    title: "Progresso do Deck 🚀",
    description: "Porcentagem de cards com alta retenção neste deck. Decks com 100% de progresso contribuem totalmente para seu nível. Dominar múltiplos decks é o caminho para avançar do nível Aprendiz (100+ cards) até Nativo (15.000+ cards)!",
    icon: "progress-check",
    color: "#E0D2FF" // Tom pastel de lilás
  }
};

// Substitua a função getThemeName por esta versão correta:

// Adicione esta função logo após a definição dos tooltipContents (linha ~76)

// NOVA IMPLEMENTAÇÃO: Sistema de temas 
const getThemeIcon = () => {
  if (!deckData) return { icon: 'grid', color: '#CB48DF' };
  
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
  if (deckData.category) {
    category = deckData.category.toLowerCase();
  } 
  // Caso contrário, tentar mapear do theme
  else if (deckData.theme) {
    category = themeToCategory[deckData.theme] || 'geral';
  }
  // Detectar tema pelo nome (fallback)
  else {
    // Tentar identificar tema pelo nome do deck
    const name = deckData.name ? deckData.name.toLowerCase() : '';
    
    for (const [key, value] of Object.entries(themeToCategory)) {
      if (name.includes(value)) {
        category = value;
        break;
      }
    }
    
    // Se ainda não encontrou, use geral
    if (!category) {
      category = 'geral';
    }
  }
  
  // Retorna o ícone e cor apropriados ou o default
  return themes[category] || themes['geral'];
};

// Adicione esta função logo após o getThemeIcon() (antes da linha que chama getThemeName)

// Função para obter o nome do tema
const getThemeName = () => {
  if (!deckData) return "Geral";
  
  // Obter a categoria atual primeiro
  let currentCategory = '';
  
  // Usar a mesma lógica do getThemeIcon para determinar a categoria
  if (deckData.category) {
    currentCategory = deckData.category.toLowerCase();
  } else if (deckData.theme) {
    const themeToCategory = {
      '1': 'entretenimento',
      '2': 'comida',
      '3': 'compras',
      '4': 'idiomas',
      '5': 'viagem',
      '6': 'negócios',
      '7': 'tecnologia',
      '8': 'educação',
      '9': 'esportes',
      '10': 'médico',
      '11': 'arte',
      '12': 'ciências',
      '13': 'história',
      '14': 'matemática',
      '15': 'música',
      '16': 'literatura',
      '17': 'geografia',
      '18': 'direito',
      '19': 'economia',
      '20': 'religião',
      '21': 'filosofia',
      '22': 'psicologia',
      '23': 'culinária',
      '24': 'ecologia',
      '25': 'moda',
    };
    currentCategory = themeToCategory[deckData.theme] || 'geral';
  } else {
    currentCategory = 'geral';
  }
  
  // Mapeamento direto de categoria para nome de exibição
  const themeNames = {
    'entretenimento': 'Entretenimento',
    'comida': 'Gastronomia',
    'compras': 'Compras',
    'idiomas': 'Idiomas',
    'viagem': 'Viagens',
    'negócios': 'Negócios',
    'tecnologia': 'Tecnologia',
    'educação': 'Educação',
    'esportes': 'Esportes',
    'médico': 'Saúde',
    'arte': 'Artes',
    'ciências': 'Ciências',
    'história': 'História',
    'matemática': 'Matemática',
    'música': 'Música',
    'literatura': 'Literatura',
    'geografia': 'Geografia',
    'direito': 'Direito',
    'economia': 'Economia',
    'religião': 'Religião',
    'filosofia': 'Filosofia',
    'psicologia': 'Psicologia',
    'culinária': 'Culinária',
    'ecologia': 'Meio Ambiente',
    'moda': 'Moda & Beleza',
    'geral': 'Geral'
  };
  
  // Retorna o nome do tema ou um valor padrão
  return themeNames[currentCategory] || 'Tema Personalizado';
};

  // Obter tema, ícone e cor
  const { icon, color } = getThemeIcon();

  
  const themeName = getThemeName();

  // Funções de cores para estatísticas
  function getRetentionColor(retention, pastelMode = false) {
    if (pastelMode) {
      if (retention >= 80) return '#A8E6CF'; // Verde pastel
      if (retention >= 50) return '#B6D8FF'; // Amarelo pastel
      return '#FF9EB5'; // Vermelho pastel
    } else {
      if (retention >= 80) return '#4CAF50'; // Verde
      if (retention >= 50) return '#FFC107'; // Amarelo
      return '#F44336'; // Vermelho
    }
  }

  function getProgressColor(percentage, pastelMode = false) {
    if (pastelMode) {
      if (percentage >= 80) return '#A8E6CF'; // Verde pastel
      if (percentage >= 50) return '#B6D8FF'; // Azul pastel
      return '#FF9EB5'; // Roxo pastel
    } 
  }

  // Recálculo de estatísticas
  async function recalculateDeckStats() {
    try {
      // Referência para o deck
      const deckRef = doc(db, "decks", deckId);
      
      // Buscar todos os flashcards deste deck
      const flashcardsQuery = query(
        collection(db, "flashcards"),
        where("deckId", "==", deckId)
      );
      
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      
      // Estatísticas iniciais
      let studiedCards = 0;
      let cardsWithHighRetention = 0;
      let totalRetention = 0;
      
      // Processar cada flashcard
      flashcardsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.stats && data.stats.attempts > 0) {
          studiedCards++;
          totalRetention += data.stats.retention || 0;
          
          if (data.stats.highRetentionAchieved) {
            cardsWithHighRetention++;
          }
        }
      });
      
      // Cálculos finais
      const totalCards = flashcardsSnapshot.size;
      const overallRetention = studiedCards > 0 ? Math.round(totalRetention / studiedCards) : 0;
      const completionPercentage = totalCards > 0 ? Math.round((cardsWithHighRetention / totalCards) * 100) : 0;
      
      // Atualizar o documento do deck
      await updateDoc(deckRef, {
        stats: {
          totalCards,
          studiedCards,
          cardsWithHighRetention,
          overallRetention,
          completionPercentage
        }
      });
      
      // Atualizar a UI
      setDeckData(prev => ({
        ...prev,
        stats: {
          totalCards,
          studiedCards,
          cardsWithHighRetention,
          overallRetention,
          completionPercentage
        }
      }));
      
      Alert.alert("Sucesso", "Estatísticas atualizadas com sucesso!");
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Não foi possível atualizar as estatísticas.");
    }
  }

  const showTooltip = (tooltipId) => {
    setActiveTooltip(tooltipId);
  };

  // Componente de Tooltip Centralizado
  const CenteredTooltip = ({ tooltipId, onClose }) => {
    if (!tooltipId || !tooltipContents[tooltipId]) return null;
    
    const content = tooltipContents[tooltipId];
    
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={true}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.centeredTooltipOverlay}>
            <TouchableWithoutFeedback>
              <Animatable.View 
                animation="zoomIn" 
                duration={300}
                style={[
                  styles.centeredTooltipContainer,
                  { backgroundColor: content.color }
                ]}
              >
                <View style={styles.tooltipIconContainer}>
                  <MaterialCommunityIcons 
                    name={content.icon} 
                    size={36} 
                    color="#CB48DF" 
                  />
                </View>
                
                <Text style={styles.centeredTooltipTitle}>{content.title}</Text>
                
                <Text style={styles.centeredTooltipDescription}>
                  {content.description}
                </Text>
                
                <TouchableOpacity 
                  style={styles.centeredTooltipButton}
                  onPress={onClose}
                >
                  <Text style={styles.centeredTooltipButtonText}>Entendi! 👍</Text>
                </TouchableOpacity>
              </Animatable.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Funções de gerenciamento do componente
  useEffect(() => {
    let unsubscribe;

    async function fetchDeckData() {
      try {
        if (!deckId) {
          throw new Error("deckId está indefinido!");
        }

        const deckRef = doc(db, "decks", deckId);
        const deckSnap = await getDoc(deckRef);

        if (deckSnap.exists()) {
          const deckInfo = { id: deckSnap.id, ...deckSnap.data() };

          if (!deckInfo.name || !deckInfo.description) {
            throw new Error("Dados do deck estão incompletos!");
          }

          setDeckData(deckInfo);
          await fetchFlashcards(deckId);
        } else {
          throw new Error("Deck não encontrado!");
        }
      } catch (error) {
        void 0;
      } finally {
        setLoading(false);
      }
    }

    async function fetchFlashcards(deckId) {
      try {
        const q = query(
          collection(db, "flashcards"),
          where("deckId", "==", deckId)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const flashcardsArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setFlashcards(flashcardsArray);
        });
      } catch (error) {
        void 0;
      }
    }

    fetchDeckData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [deckId]);

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color="#cb48df" />
      </View>
    );
  }

  if (!deckData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Erro ao carregar os dados do deck.</Text>
      </View>
    );
  }

  function handleClose() {
    fechar();
  }

  async function handleDelete() {
    Alert.alert(
      "Excluir Deck",
      "Você tem certeza que deseja excluir este deck?",
      [
        {
          text: "Voltar",
          style: "cancel"
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "decks", deckId));
              Alert.alert("Deck excluído com sucesso!");
            } catch (error) {
              void 0;
              Alert.alert("Erro ao excluir o deck!");
            } finally {
              fechar();
            }
          }
        }
      ]
    );
  }

  function handleAddWord() {
    setIsAddFlashcardVisible(true);
  }

  async function handleDeleteFlashcard(id) {
    Alert.alert(
      "Confirmar Deleção",
      "Você tem certeza que deseja deletar este flashcard?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "flashcards", id));
              setFlashcards((prevFlashcards) =>
                prevFlashcards.filter((flashcard) => flashcard.id !== id)
              );
              Alert.alert("Sucesso", "Flashcard deletado com sucesso.");
            } catch (error) {
              void 0;
              Alert.alert("Erro", "Não foi possível deletar o flashcard.");
            }
          }
        }
      ],
      { cancelable: true }
    );
  }

  function handleEditFlashcard(item) {
    setFlashcardToEdit(item);
    setModalDetails(true);
  }

  function closeDetails() {
    setModalDetails(false);
  };

  async function handleShareDeck() {
    try {
      // Monta o link com o scheme "brainly://".
      const deckLink = `https://example.invalid/mybrainly-demo/share?deckId=${deckId}`;
  
      await Share.share({
        message: `Confira este deck no MyBrainly: ${deckLink}`
      });
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Deck não encontrado. Lembrando que o deck precisa estar disponível no explorar para ser compartilhado.");
    }
  }

  function renderHiddenItemTransaction({ item }) {
    return (
      <View style={styles.hiddenRow}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleEditFlashcard(item)}
        >
          <Feather name="edit" size={20} color="#F194FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFlashcard(item.id)}
        >
          <Fontisto name="trash" size={20} color='#F194FF' />
        </TouchableOpacity>
      </View>
    );
  }

  const headerComponent = (
    <View style={{ paddingHorizontal: 20}}>
      <View style={styles.viewHead}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <TouchableOpacity style={styles.buttonAction} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="#CB48DF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonAction} onPress={handleShareDeck}>
            <EvilIcons name="share-apple" size={30} color="#CB48DF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonAction} onPress={handleAddWord}>
          <Text style={styles.backText}>Add flashcard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsTitleContainer}>
          <Text style={styles.statsTitle}>Estatísticas do Deck</Text>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => showTooltip('general')}
          >
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <Ionicons name="information-circle" size={22} color="#CB48DF" />
            </Animatable.View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <Animatable.View 
            animation="fadeInLeft" 
            delay={100}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="cards" size={20} color="#7FAEFF" />
              <Text style={styles.statLabel}>Total de Cards</Text>
              <TouchableOpacity onPress={() => showTooltip('totalCards')}>
                <Ionicons name="help-circle" size={18} color="#7FAEFF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.statValue, {color: '#7FAEFF'}]}>
              {deckData.stats?.totalCards || flashcards.length}
            </Text>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInRight" 
            delay={200}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="eye-check" size={20} color="#7ED4A6" />
              <Text style={styles.statLabel}>Cards Estudados</Text>
              <TouchableOpacity onPress={() => showTooltip('studiedCards')}>
                <Ionicons name="help-circle" size={18} color="#7ED4A6" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.statValue, {color: '#7ED4A6'}]}>
              {deckData.stats?.studiedCards || 0}
            </Text>
          </Animatable.View>
        </View>
        
        <View style={styles.statsRow}>
          <Animatable.View 
            animation="fadeInLeft" 
            delay={300}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="brain" size={20} color="#FFA978" />
              <Text style={styles.statLabel}>Alta Retenção</Text>
              <TouchableOpacity onPress={() => showTooltip('highRetention')}>
                <Ionicons name="help-circle" size={18} color="#FFA978" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.statValue, {color: '#FFA978'}]}>
              {deckData.stats?.cardsWithHighRetention || 0}
            </Text>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInRight" 
            delay={400}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <AntDesign name="linechart" size={20} color={getRetentionColor(deckData.stats?.overallRetention || 0, true)} />
              <Text style={styles.statLabel}>Retenção Geral</Text>
              <TouchableOpacity onPress={() => showTooltip('overallRetention')}>
                <Ionicons name="help-circle" size={18} color={getRetentionColor(deckData.stats?.overallRetention || 0, true)} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.statValue, { color: getRetentionColor(deckData.stats?.overallRetention || 0, true) }]}>
              {deckData.stats?.overallRetention || 0}%
            </Text>
          </Animatable.View>
        </View>
        
        {/* Barra de progresso aprimorada */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={500}
          style={styles.progressContainer}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso do Deck</Text>
            <TouchableOpacity onPress={() => showTooltip('progress')}>
              <Ionicons name="help-circle" size={18} color="#CB48DF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressBarOuterContainer}>
            <View style={styles.progressBarContainer}>
              <Animatable.View 
                animation="fadeIn"
                duration={800}
                style={[
                  styles.progressBar, 
                  { 
                    width: `${deckData.stats?.completionPercentage || 0}%`,
                    backgroundColor: getProgressColor(deckData.stats?.completionPercentage || 0, true)
                  }
                ]} 
              />
            </View>
            
            <View style={styles.progressMilestones}>
              <View style={styles.milestone}>
                <View style={[styles.milestoneMarker, {backgroundColor: '#FF9EB5'}]} />
                <Text style={styles.milestoneLabel}>0%</Text>
              </View>
              <View style={styles.milestone}>
                <View style={[styles.milestoneMarker, {backgroundColor: '#7AB3FF'}]} />
                <Text style={styles.milestoneLabel}>50%</Text>
              </View>
              <View style={styles.milestone}>
                <View style={[styles.milestoneMarker, {backgroundColor: '#A8E6CF'}]} />
                <Text style={styles.milestoneLabel}>100%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressFooter}>
            <Text style={styles.progressPercentage}>
              {deckData.stats?.completionPercentage || 0}% completo
            </Text>
            <TouchableOpacity 
              style={styles.refreshButtonMini}
              onPress={recalculateDeckStats}
            >
              <Animatable.View animation="rotate" iterationCount="infinite" duration={3000}>
                <Ionicons name="refresh" size={16} color="#CB48DF" />
              </Animatable.View>
              <Text style={styles.refreshButtonTextMini}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>

      <View style={styles.viewDoc}>
        <Text style={styles.textDocTitle}>{deckData.name}</Text>
        <Text style={styles.textDoc}>{deckData.description}</Text>

        {/* Badge de tema */}
        <View style={styles.viewThemeContainer}>
          {/* Badge com ícone e tema */}
          <Animatable.View 
            animation="bounceIn"
            delay={300}
            style={[styles.themeBadge, { backgroundColor: `${color}15` }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: color }]}>
              <Ionicons name={icon} size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.themeBadgeText, { color: color }]}>{themeName}</Text>
          </Animatable.View>

          {/* Contador de cards */}
          <View style={styles.viewVocabNumber}>
            <Text style={[styles.textVocabNumber, { color: color }]}>{flashcards.length}</Text>
            <Text style={styles.textVocabLabel}>cards</Text>
          </View>
        </View>
      </View>

      <Modal visible={modalDetails} transparent={true} animationType="none">
        <ModalDetail
          fechar={closeDetails}
          onDelete={handleDelete}
          wordData={flashcardToEdit}
        />
      </Modal>
    </View>
  );

  return (
    <Modal visible={true} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        {/* Área para fechar o modal ao clicar fora */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>

        {/* Conteúdo do modal */}
        <View style={styles.modalContent}>
          <SwipeListView
            data={flashcards}
            renderItem={({ item }) => <ListWords data={item} onDelete={handleDeleteFlashcard}/>}
            renderHiddenItem={renderHiddenItemTransaction}
            rightOpenValue={-75}
            leftOpenValue={75}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={headerComponent}
            contentContainerStyle={{
              flexGrow: 1,
              backgroundColor: '#fff',
              gap: 20,
              paddingBottom: 160,
            }}
          />
        </View>

        {/* Modal para adicionar flashcard */}
        {isAddFlashcardVisible && (
          <ModalAddFlashcard
            fechar={() => {
              setIsAddFlashcardVisible(false);
              // Não fechar o modal principal aqui
            }}
            deckId={deckId}
            totalWords={flashcards.length}
            navigation={navigation} 
          />
        )}
        {activeTooltip && (
          <CenteredTooltip
            tooltipId={activeTooltip}
            onClose={() => setActiveTooltip(null)}
          />
        )}
      </View>
    </Modal>
  );
}