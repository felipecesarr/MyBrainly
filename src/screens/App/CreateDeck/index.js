import React, { useState, useEffect, useContext, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

import SelectedList from "../../../components/SelectedList";
import EmptyList from "../../../components/EmptyList";
import FooterList from "../../../components/FooterList";
import ModalDeck from "../../../components/ModalDeck";

import { AuthContext } from "../../../contexts/AuthContext";
import { ProfileContext } from "../../../contexts/ProfilesContext";
import { useRevenueCat } from "../../../contexts/RevenueCatContext";
import { db } from "../../../db/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Definição correta da altura da barra de status
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 
  (Dimensions.get('window').height >= 812 ? 44 : 20) : 
  StatusBar.currentHeight || 0;

export default function CreateDeck() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext);
  const { user: rcUser } = useRevenueCat();
  
  const [flashcards, setFlashcards] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [modalAddDeck, setModalAddDeck] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Animações
  const scrollY = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [Platform.OS === 'ios' ? 140 : 130, Platform.OS === 'ios' ? 110 : 100],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.97],
    extrapolate: 'clamp',
  });
  
  const headerElevation = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, Platform.OS === 'android' ? 8 : 0],
    extrapolate: 'clamp',
  });

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.2],
    extrapolate: 'clamp',
  });

  const fabScale = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  // Efeito para carregar flashcards
  useEffect(() => {
    if (user && selectedProfile) {
      setLoading(true);
      const q = query(
        collection(db, "flashcards"),
        where("deckId", "==", "NuLCnQtWeMsDkgLNy1cY"), 
        where("userId", "==", user.uid),
        where("profileId", "==", selectedProfile.id)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const flashcardsArray = [];
        querySnapshot.forEach((doc) => {
          flashcardsArray.push({ id: doc.id, ...doc.data() });
        });
        setFlashcards(flashcardsArray);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, selectedProfile]);

  // Efeito para animar o botão FAB
  useEffect(() => {
    if (selectedWords.length > 0) {
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [selectedWords.length]);

  // Função de toggle corrigida com tratamento de erro
  const toggleSelectWord = (word) => {
    try {
      setSelectedWords(prev => {
        if (prev.some(item => item.id === word.id)) {
          return prev.filter(item => item.id !== word.id);
        } else {
          return [...prev, word];
        }
      });
    } catch (error) {
      void 0;
    }
  };

  const handleContinue = () => {
    if (selectedWords.length === 0) {
      Alert.alert("Selecione Palavras", "Selecione pelo menos uma palavra para criar um deck.");
      return;
    }
    
    // Feedback tátil
    if (Platform.OS === 'ios') {
      try {
        const impactStyle = { style: 'medium' };
        if (impactStyle) {
          const UIImpactFeedbackGenerator = require('react-native').UIImpactFeedbackGenerator;
          const impactFeedbackGenerator = new UIImpactFeedbackGenerator(impactStyle);
          impactFeedbackGenerator.impactOccurred();
        }
      } catch (error) {
        void 0;
      }
    }
    
    navigation.navigate('Creater', { selectedWords });
  };

  const toggleSelectAll = () => {
    // Feedback tátil
    if (Platform.OS === 'ios') {
      try {
        const impactStyle = { style: 'light' };
        if (impactStyle) {
          const UIImpactFeedbackGenerator = require('react-native').UIImpactFeedbackGenerator;
          const impactFeedbackGenerator = new UIImpactFeedbackGenerator(impactStyle);
          impactFeedbackGenerator.impactOccurred();
        }
      } catch (error) {
        void 0;
      }
    }
    
    if (selectedWords.length === flashcards.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords([...flashcards]);
    }
  };

  function navigateIaGenerate() {
    
    if (rcUser?.plus) {
      navigation.navigate('GenerateIa');
    } else {
      Alert.alert(
        "Recurso Premium",
        "Geração com IA está disponível apenas para assinantes Plus. Quer conhecer os benefícios?",
        [
          { text: "Agora não", style: "cancel" },
          { 
            text: "Ver planos", 
            onPress: () => navigation.navigate("Assinatura")
          }
        ]
      );
    }
  }

  const allSelected = flashcards.length > 0 && selectedWords.length === flashcards.length;

  const renderHeader = () => (
    <Animated.View style={styles.headerContainer}>
      <LinearGradient
        colors={['#FFFFFF', '#fff']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.safeAreaHeader}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={26} color="#414141" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.generateAiButton}
              onPress={navigateIaGenerate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#CB48DF', '#ef238f']}
                style={styles.generateAiButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <FontAwesome6 name="wand-magic-sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.generateAiButtonText}>Gerar com IA</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <Ionicons 
                name={allSelected ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={30} 
                color="#CB48DF" 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.contentContainer}>
        <FlatList
          data={flashcards}
          renderItem={({ item, index }) => (
            <View style={styles.itemContainer}>
              <SelectedList 
                data={item} 
                onSelect={() => toggleSelectWord(item)} 
                isSelected={selectedWords.some(word => word.id === item.id)}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyList 
              loading={loading}
              message="Você ainda não tem palavras salvas"
            />
          }
          ListFooterComponent={<FooterList />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContentContainer,
            flashcards.length === 0 && styles.emptyListContainer
          ]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      </View>

      {/* Botão flutuante de continuar - Aparece quando há palavras selecionadas */}
      {selectedWords.length > 0 && (
        <Animated.View 
          style={[
            styles.continueButtonContainer,
            { transform: [{ scale: fabScale }] }
          ]}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#CB48DF', '#ef238f']}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={{height: 24, width: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 100}}> 
                <Text style={{color: '#CB48DF', fontWeight: '700'}}>{selectedWords.length}</Text>
              </View>
              <Text style={styles.continueButtonText}>
                Continuar
              </Text>
              <View style={styles.continueIconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Modal do deck */}
      {modalAddDeck && (
        <ModalDeck 
          fechar={() => setModalAddDeck(false)} 
          selectedWords={selectedWords} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 80 : 70,
    alignItems: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f6f6f6',
  },
  generateAiButton: {

  },
  generateAiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    width: '70%',
    borderRadius: 12,
    paddingHorizontal: 14,
    alignSelf: 'center',
  },
  generateAiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectAllButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemContainer: {
    marginVertical: 4,
  },
  listContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  continueButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 50 : 40,
    zIndex: 101,
  },
  continueButton: {
    shadowColor: '#CB48DF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 50,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderRadius: 50,
    paddingHorizontal: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  continueIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});