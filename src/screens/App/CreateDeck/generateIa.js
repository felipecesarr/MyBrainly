// GenerateIa.js
import { requestGeneratedFlashcards } from "../../../services/aiDeckClient";
import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  TouchableWithoutFeedback, 
  Keyboard, 
  SafeAreaView, 
  Switch,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from "@react-navigation/native";
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileContext } from '../../../contexts/ProfilesContext';
import { AuthContext } from "../../../contexts/AuthContext";
import { 
  collection, 
  addDoc, 
  writeBatch, 
  doc, 
  query, 
  where, 
  getDocs,
  Timestamp
} from "firebase/firestore"; 
import { db } from "../../../db/config/index";
import Constants from 'expo-constants';
import * as Animatable from 'react-native-animatable';

const deckThemes = [
  { key: "1", emoji: "🎬", title: "Filmes & Séries" },
  { key: "2", emoji: "🍣", title: "Gastronomia" },
  { key: "3", emoji: "🛒", title: "Supermercado" },
  { key: "4", emoji: "🩷", title: "Dates & Relacionamentos" },
  { key: "5", emoji: "🌍", title: "Viagens & Turismo" },
  { key: "6", emoji: "💼", title: "Negócios & Trabalho" },
  { key: "7", emoji: "💻", title: "Tecnologia" },
  { key: "8", emoji: "🏋️", title: "Esportes & Fitness" },
  { key: "9", emoji: "🧥", title: "Moda & Estilo" },
  { key: "10", emoji: "🏥", title: "Saúde & Bem-estar" },
  { key: "11", emoji: "📚", title: "Educação & Estudo" },
  { key: "12", emoji: "🎨", title: "Música & Artes" },
  { key: "13", emoji: "🎮", title: "Jogos & Entretenimento" },
  { key: "14", emoji: "🐶", title: "Animais & Natureza" },
  { key: "15", emoji: "🏙️", title: "Cotidiano & Vida Urbana" },
  { key: "16", emoji: "🛍️", title: "Compras & Lojas" },
  { key: "17", emoji: "🏛️", title: "Cultura & História" },
  { key: "18", emoji: "🌦️", title: "Clima & Estações" },
  { key: "19", emoji: "🚗", title: "Meios de Transporte" },
  { key: "20", emoji: "💰", title: "Finanças & Economia" },
  { key: "21", emoji: "🎉", title: "Eventos & Festas" },
  { key: "22", emoji: "♟️", title: "Jogos de Mesa & Estratégia" },
  { key: "23", emoji: "📸", title: "Fotografia" },
  { key: "24", emoji: "🎶", title: "Música" },
  { key: "25", emoji: "🙏", title: "Fé & Religião" }
];

const AI_DECK_ENDPOINT = Constants.expoConfig?.extra?.AI_DECK_ENDPOINT;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GenerateIa() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { selectedProfile } = useContext(ProfileContext); 
  const { user } = useContext(AuthContext);
  const [wordCount, setWordCount] = useState(10); // Valor inicial melhor
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // Para animação de progresso
  const [loadingMessage, setLoadingMessage] = useState('Preparando geração...'); // Mensagem dinâmica de loading
  const [deck, setDeck] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [aiDecksCount, setAiDecksCount] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(null);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // Função para parsear o conteúdo do deck gerado pela IA
  function parseDeckContent(content) {
    try {
      const flashcards = JSON.parse(content);
      // Validar a estrutura dos flashcards
      if (!Array.isArray(flashcards)) {
        throw new Error("Formato inválido: esperado um array.");
      }
      flashcards.forEach(card => {
        if (!card.word || !card.translation || !card.example) {
          throw new Error("Formato inválido: cada flashcard deve conter 'word', 'translation' e 'example'.");
        }
      });
      return flashcards;
    } catch (error) {
      void 0;
      Alert.alert('Erro', 'O formato do deck gerado está inválido.');
      return [];
    }
  }

  // Função para obter a data de início do mês atual como Timestamp
  function getStartOfCurrentMonth() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return Timestamp.fromDate(startOfMonth);
  }

  // Função para verificar o número de decks gerados pela IA no mês atual
  async function checkMonthlyDeckLimit() {
    try {
      void 0;
      const startOfMonth = getStartOfCurrentMonth();
      void 0;

      const decksQuery = query(
        collection(db, "decks"),
        where("userId", "==", user.uid),
        where("generatedByAI", "==", true),
        where("createdAt", ">=", startOfMonth)
      );

      const querySnapshot = await getDocs(decksQuery);
      const count = querySnapshot.size;
      void 0;
      setAiDecksCount(count); // Atualiza o estado

      return count;
    } catch (error) {
      void 0;
      Alert.alert('Erro', 'Não foi possível verificar o limite de decks.');
      return null; // Alteração para indicar erro
    }
  }

  // Chama a função ao montar o componente
  useEffect(() => {
    void 0;
    if (!user || !user.uid) {
      Alert.alert('Erro', 'Usuário não autenticado.');
    } else {
      checkMonthlyDeckLimit();
    }
  }, []);

  // Efeito para a animação de loading
  useEffect(() => {
    if (loading) {
      let progress = 0;
      const messages = [
        'Preparando geração...',
        'Criando flashcards...',
        'Traduzindo conteúdo...',
        'Gerando exemplos...',
        'Finalizando seu deck...'
      ];
      
      const interval = setInterval(() => {
        progress += 0.01;
        setLoadingProgress(Math.min(progress, 0.95));
        
        // Altera a mensagem com base no progresso
        if (progress <= 0.2) setLoadingMessage(messages[0]);
        else if (progress <= 0.4) setLoadingMessage(messages[1]);
        else if (progress <= 0.6) setLoadingMessage(messages[2]);
        else if (progress <= 0.8) setLoadingMessage(messages[3]);
        else setLoadingMessage(messages[4]);
        
        if (progress >= 1) clearInterval(interval);
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [loading]);

  async function handleGenerateDeck() {
    if (!title || !description || !wordCount || !selectedTheme) {
      Alert.alert('Campos obrigatórios', 'Preencha o título, a descrição e o tema.');
      return;
    }
    if (!AI_DECK_ENDPOINT || !/^https:\/\//.test(AI_DECK_ENDPOINT)) {
      Alert.alert('Backend de IA não configurado', 'Esta cópia pública não inclui chaves privadas. Configure um endpoint HTTPS próprio que valide a sessão Firebase e mantenha a chave do provedor no servidor.');
      return;
    }
    setLoading(true);
    setLoadingProgress(0);
    Keyboard.dismiss();
    try {
      const flashcards = await requestGeneratedFlashcards({
        endpoint: AI_DECK_ENDPOINT,
        getIdToken: user?.getIdToken ? () => user.getIdToken() : null,
        title, description, language: selectedProfile.language,
        count: Number(wordCount.toFixed(0))
      });
      const deckContent = JSON.stringify(flashcards);
      setDeck(deckContent);
      setLoadingProgress(1);
      await addDeckToFirebase(deckContent, title, description);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o deck. Confira sua sessão e a configuração do backend.');
    } finally {
      setLoading(false);
    }
  }

  async function addDeckToFirebase(deckContent, deckTitle, deckDescription) {
    try {
      // Parse do conteúdo gerado para extrair os flashcards
      const flashcards = parseDeckContent(deckContent);
  
      if (flashcards.length === 0) {
        Alert.alert('Erro', 'Nenhum flashcard foi encontrado no conteúdo gerado.');
        return;
      }
  
      // Cria o novo deck no Firestore com o campo 'generatedByAI' como true
      const deckRef = await addDoc(collection(db, "decks"), {
        name: deckTitle, // Título do deck
        description: deckDescription, // Descrição do deck
        cover: "https://example.invalid/mybrainly-demo/asset.png",
        isPublic: isEnabled,
        profileId: selectedProfile.id,
        userId: user.uid,
        theme: selectedTheme,
        createdAt: Timestamp.fromDate(new Date()), // Use Timestamp
        generatedByAI: true, // Adiciona este campo para identificar decks gerados pela IA
        downloadCount: 0,
        
        // Novos campos de estatísticas para gamificação
        stats: {
          totalCards: flashcards.length,  // Já sabemos a quantidade exata
          studiedCards: 0,
          cardsWithHighRetention: 0,
          overallRetention: 0,
          completionPercentage: 0
        }
      });
  
      // Utiliza batch para criar os flashcards
      const batch = writeBatch(db);
      flashcards.forEach((card) => {
        const newFlashcardRef = doc(collection(db, "flashcards")); // Cria um novo documento na coleção "flashcards"
        batch.set(newFlashcardRef, {
          word: card.word,
          translation: card.translation,
          example: card.example,
          deckId: deckRef.id, // Associa ao deck criado
          createdAt: Timestamp.fromDate(new Date()), // Use Timestamp
          userId: user.uid, // Define o dono do flashcard
          profileId: selectedProfile.id,
          
          // Novos campos de estatísticas para cada flashcard
          stats: {
            attempts: 0,
            correctAnswers: 0,
            retention: 0,
            highRetentionAchieved: false,
            lastStudied: null
          }
        });
      });
  
      await batch.commit();
  
      Alert.alert("Sucesso", "Deck gerado e salvo com sucesso!");
      navigation.navigate("Home");
  
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Ocorreu um erro ao salvar o deck no Firebase.");
    }
  }

  if(loading){
    return (
      <LinearGradient
        colors={['#CB48DF', '#ef238f']}
        style={styles.loadingContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#CB48DF" />
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={1500}
          style={styles.loadingIconContainer}
        >
          <FontAwesome6 name="wand-magic-sparkles" size={48} color="#FFFFFF" />
        </Animatable.View>
        
        <Animatable.Text 
          animation="fadeIn" 
          style={styles.loadingTitle}
        >
          {loadingMessage}
        </Animatable.Text>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${loadingProgress * 100}%` }]} />
        </View>
        
        <Text style={styles.loadingSubtitle}>
          Gerando {wordCount} flashcards para "{title}"
        </Text>
        
        <View style={styles.loadingFooter}>
          <Text style={styles.loadingFooterText}>powered by</Text>
          <Text style={styles.loadingFooterBranding}>MyBrainly AI</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.buttonBack} 
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="chevron-back" size={24} color="#414141" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Criar com AI</Text>
            
            <TouchableOpacity 
              style={styles.generateButton} 
              onPress={handleGenerateDeck} 
              disabled={aiDecksCount >= 7}
            >
              <LinearGradient
                colors={aiDecksCount >= 7 ? ['#cccccc', '#aaaaaa'] : ['#CB48DF', '#ef238f']}
                style={styles.generateButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.generateButtonText}>Gerar</Text>
                <FontAwesome6 name="wand-magic-sparkles" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.limitIndicatorContainer}>
            <LinearGradient
              colors={['#F0F0F0', '#FFFFFF']}
              style={styles.limitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
             <Text style={styles.limitText}>Decks usados no mês:</Text>
              <View style={styles.limitCounterContainer}>
                {[...Array(7)].map((_, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.limitDot,
                      { backgroundColor: index < aiDecksCount ? '#CB48DF' : '#E0E0E0' }
                    ]}
                  />
                ))}
                <Text style={styles.limitCountText}>{aiDecksCount}/7</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.formSection}>
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIcon}>
                <FontAwesome6 name="heading" size={16} color="#CB48DF" />
              </View>
              <Text style={styles.formSectionTitle}>Título do Deck</Text>
            </View>
            <TextInput
              placeholder="Ex: Inglês para mercado"
              placeholderTextColor={'#888'}
              style={styles.input}
              maxLength={30}
              value={title}
              onChangeText={(text) => setTitle(text)}
            />
            <Text style={styles.characterCount}>{title.length}/30</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIcon}>
                <FontAwesome6 name="align-left" size={16} color="#CB48DF" />
              </View>
              <Text style={styles.formSectionTitle}>Descrição</Text>
            </View>
            <TextInput 
              placeholder="Ex: Vocabulário para compras no supermercado nos EUA, com as principais palavras do inglês americano do dia a dia" 
              placeholderTextColor={'#888'} 
              style={styles.inputDescription}
              multiline={true}
              numberOfLines={4}
              textAlignVertical='top'
              value={description}
              onChangeText={(text) => setDescription(text)}
            />
          </View>

          <View style={styles.formSection}>
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIcon}>
                <FontAwesome6 name="layer-group" size={16} color="#CB48DF" />
              </View>
              <Text style={styles.formSectionTitle}>Quantidade de Flashcards</Text>
              <Text style={styles.wordCountDisplay}>{wordCount.toFixed(0)}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>1</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={70}
                step={1}
                minimumTrackTintColor="#CB48DF"
                maximumTrackTintColor="#EEEEEE"
                thumbTintColor="#CB48DF"
                value={wordCount}
                onValueChange={(number) => {setWordCount(number);}}
              />
              <Text style={styles.sliderLabel}>70</Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIcon}>
                <FontAwesome6 name="tag" size={16} color="#CB48DF" />
              </View>
              <Text style={styles.formSectionTitle}>Selecione uma temática</Text>
            </View>
            <ScrollView
              style={styles.themesScrollView}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themesContainer}
            >
              {deckThemes.map((theme) => {
                const isSelected = selectedTheme === theme.key;
                
                return (
                  <TouchableOpacity
                    key={theme.key}
                    onPress={() => setSelectedTheme(theme.key)}
                    style={[styles.themeButton, isSelected && styles.selectedThemeButton]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                    <Text style={[styles.themeText, isSelected && styles.selectedThemeText]}>
                      {theme.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <View style={styles.shareContainer}>
              <View style={styles.shareTextContainer}>
                <View style={styles.formSectionHeader}>
                  <View style={styles.formSectionIcon}>
                    <FontAwesome6 name="share-nodes" size={16} color="#CB48DF" />
                  </View>
                  <Text style={styles.formSectionTitle}>Compartilhar no explorar?</Text>
                </View>
                <Text style={styles.shareDescription}>
                  Compartilhe seu deck para que outros estudantes possam aproveitar!
                </Text>
              </View>
              <Switch
                trackColor={{false: '#E0E0E0', true: '#f5b1ff'}}
                thumbColor={isEnabled ? '#F4F4F4' : '#F4F4F4'}
                ios_backgroundColor="#E0E0E0"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Ionicons name="information-circle" size={24} color="#CB48DF" />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Dica:</Text>
              <Text style={styles.infoCardText}>
                Quanto mais detalhada for sua descrição, melhores serão os flashcards gerados pela IA.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  buttonBack: {
    padding: 8,
    borderRadius: 20,
  },
  generateButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  limitIndicatorContainer: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  limitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  limitText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  limitCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  limitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  limitCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginLeft: 6,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1
  },
  formSection: {
    marginBottom: 44,
    paddingHorizontal: 10,
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formSectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(203, 72, 223, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  wordCountDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CB48DF',
    backgroundColor: 'rgba(203, 72, 223, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  inputDescription: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    width: 24,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  themesScrollView: {
    marginLeft: -8,
  },
  themesContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 10,
  },
  themeButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 8,
  },
  selectedThemeButton: {
    backgroundColor: 'rgba(203, 72, 223, 0.1)',
    borderColor: '#CB48DF',
  },
  themeEmoji: {
    fontSize: 16,
    marginBottom: 6,
  },
  themeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  selectedThemeText: {
    color: '#CB48DF',
    fontWeight: '700',
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareTextContainer: {
    flex: 1,
  },
  shareDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(203, 72, 223, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoCardIcon: {
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  loadingFooter: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  loadingFooterText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  loadingFooterBranding: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
};