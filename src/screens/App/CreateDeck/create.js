import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Switch, 
  ActivityIndicator, 
  SafeAreaView, 
  Alert, 
  ScrollView,
  StatusBar,
  Platform,
  Dimensions
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../../../db/config";
import { AuthContext } from "../../../contexts/AuthContext";
import { ProfileContext } from "../../../contexts/ProfilesContext";
import { collection, addDoc, writeBatch, doc, query, where, getDocs } from "firebase/firestore"; 
import { useRevenueCat } from "../../../contexts/RevenueCatContext";
import { LinearGradient } from 'expo-linear-gradient';
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

export default function Creater() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext);
  const route = useRoute();
  const { selectedWords } = route.params;

  const [isEnabled, setIsEnabled] = useState(true);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(null);

  const { user: rcUser } = useRevenueCat();

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // Efeito para animação de progresso durante o loading
  React.useEffect(() => {
    if (loading) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.02;
        setLoadingProgress(Math.min(progress, 0.95));
        if (progress >= 1) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleCreateDeck = async () => {
    try {
      // Verifica os campos obrigatórios
      if (!deckTitle.trim() || !deckDescription.trim()) {
        Alert.alert("Campos obrigatórios", "Por favor, preencha título e descrição.");
        return;
      }
      
      if (!selectedTheme) {
        Alert.alert("Tema obrigatório", "Por favor, selecione uma temática para o deck.");
        return;
      }
  
      // Consulta quantos decks o usuário já criou
      const q = query(collection(db, "decks"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      // Se não é plus e já tem ao menos 1 deck, bloqueia
      if (!rcUser.plus && snap.size >= 1) {
        Alert.alert(
          "Requer Plano Plus",
          "Você atingiu o limite de 1 deck gratuito. Deseja assinar agora?",
          [
            { text: "Não", style: "cancel" },
            {
              text: "Sim",
              onPress: () => {
                navigation.navigate("Assinatura"); 
              }
            }
          ]
        );
        return; 
      }
    } catch (err) {
      void 0;
      // Se der erro na verificação, ainda deixamos criar o deck
    }
  
    setLoading(true);
  
    try {
      // Cria o novo deck no Firestore
      const deckRef = await addDoc(collection(db, "decks"), {
        name: deckTitle,
        description: deckDescription,
        cover: "https://example.invalid/mybrainly-demo/asset.png",
        isPublic: isEnabled,
        profileId: selectedProfile.id,
        userId: user.uid,
        theme: selectedTheme,
        createdAt: new Date(),
        generatedByAI: false,
        downloadCount: 0,
        
        // Novos campos de gamificação para o deck
        stats: {
          totalCards: selectedWords.length,  // Já sabemos quantos flashcards estão sendo adicionados
          studiedCards: 0,
          cardsWithHighRetention: 0,
          overallRetention: 0,
          completionPercentage: 0
        }
      });
  
      // Utiliza batch para criar cópias dos flashcards selecionados
      const batch = writeBatch(db);
      selectedWords.forEach((word) => {
        const newWordRef = doc(collection(db, "flashcards")); 
        batch.set(newWordRef, {
          word: word.word,
          translation: word.translation,
          example: word.example,
          deckId: deckRef.id,
          createdAt: new Date(),
          userId: user.uid,
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
  
      // Atraso artificial para mostrar a animação de loading
      setTimeout(() => {
        setLoading(false);
        Alert.alert("Sucesso!", "Deck criado com sucesso!", [
          {
            text: "Ok",
            onPress: () => navigation.navigate("Home"),
          }
        ]);
      }, 1000);
  
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Não foi possível criar o deck. Tente novamente.");
      setLoading(false);
    }
  };

  // Tela de loading redesenhada
  if (loading) {
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
          <FontAwesome6 name="layer-group" size={48} color="#FFFFFF" />
        </Animatable.View>
        
        <Text style={styles.loadingTitle}>
          Criando seu deck...
        </Text>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${loadingProgress * 100}%` }]} />
        </View>
        
        <Text style={styles.loadingSubtitle}>
          Adicionando {selectedWords.length} flashcards ao "{deckTitle}"
        </Text>
        
        <View style={styles.loadingFooter}>
          <Text style={styles.loadingFooterText}>powered by</Text>
          <Text style={styles.loadingFooterBranding}>MyBrainly</Text>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            
            <Text style={styles.headerTitle}>Criar Deck</Text>
            
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={handleCreateDeck}
            >
              <LinearGradient
                colors={['#CB48DF', '#ef238f']}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.createButtonText}>Criar</Text>
                <FontAwesome6 name="check" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfoContainer}>
            <LinearGradient
              colors={['#F0F0F0', '#FFFFFF']}
              style={styles.headerInfoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.headerInfoText}>
                <Text style={styles.headerInfoHighlight}>{selectedWords.length}</Text> palavras selecionadas
              </Text>
              <FontAwesome6 name="layer-group" size={16} color="#CB48DF" />
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
              value={deckTitle}
              onChangeText={setDeckTitle}
            />
            <Text style={styles.characterCount}>{deckTitle.length}/30</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.formSectionHeader}>
              <View style={styles.formSectionIcon}>
                <FontAwesome6 name="align-left" size={16} color="#CB48DF" />
              </View>
              <Text style={styles.formSectionTitle}>Descrição</Text>
            </View>
            <TextInput 
              placeholder="Ex: Vocabulário para compras no supermercado nos EUA" 
              placeholderTextColor={'#888'} 
              style={styles.inputDescription}
              multiline={true}
              numberOfLines={4}
              textAlignVertical='top'
              value={deckDescription}
              onChangeText={setDeckDescription}
            />
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
                Compartilhe seu deck no explorar, assim a comunidade MyBrainly também poderá utilizá-lo para evoluir nos estudos!
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  buttonBack: {
    padding: 8,
    borderRadius: 20,
  },
  createButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  headerInfoContainer: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  headerInfoText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  headerInfoHighlight: {
    fontWeight: '700',
    color: '#CB48DF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
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
    paddingLeft: 38, // Alinhado com o título após o ícone
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