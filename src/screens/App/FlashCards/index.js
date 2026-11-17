// FlashCards.js
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  Vibration
} from "react-native";
import { styles } from "./styles";
import { Entypo, Ionicons } from "@expo/vector-icons";
import CustomDecks from "../../../components/CustomDecks";
import * as Progress from "react-native-progress";
import * as Animatable from "react-native-animatable";
import { db } from "../../../db/config";
import { collection, query, where, onSnapshot, getDocs, limit } from "firebase/firestore";
import { AuthContext } from "../../../contexts/AuthContext";
import { ProfileContext } from "../../../contexts/ProfilesContext";
import {
  incrementFlashcardsCompleted,
  incrementFlashcardsCorrect,
} from "../../../utils/countDatas/index";
import { Audio } from 'expo-av';
import { useFlashCardGamification } from "./useFlashCardGamification";

const { width } = Dimensions.get('window');

// Limite de flashcards por consulta para evitar crash/memória excessiva
const FLASHCARD_QUERY_LIMIT = 100;

export default function FlashCards() {
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext);

  const [correctSound, setCorrectSound] = useState(null);
  const [incorrectSound, setIncorrectSound] = useState(null);

  const [flipped, setFlipped] = useState(true);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashcardHistory, setFlashcardHistory] = useState([]);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showInstruction, setShowInstruction] = useState(true);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState({
    correctCount: 0,
    incorrectCount: 0,
    skippedCount: 0,
    maxStreak: 0
  });
  const [selectionTimeout, setSelectionTimeout] = useState(null);

  // Controle do tempo de estudo para gamificação
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Armazena as 4 opções de resposta (1 correta + 3 incorretas)
  const [options, setOptions] = useState([]);
  // Armazena qual opção o usuário selecionou
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

  const shakeRef = useRef(null);
  const cardRef = useRef(null);
  const modalAlreadyShown = useRef(false);

  // Referência para controlar se estamos em uma sessão ativa
  const isInSession = useRef(false);
  // Esta ref guarda os flashcards embaralhados originais
  const originalShuffledFlashcards = useRef([]);
  // Esta ref controla se devemos bloquear atualizações do Firestore
  const blockFirestoreUpdates = useRef(false);

  // Usar o hook de gamificação
  const { 
    updateFlashcardStats,
    updateDailyStreak,
    logDeckCompletion,
    ensureGamificationStructure,
    isProcessing
  } = useFlashCardGamification();

  const defaultFlashcard = {
    id: "default",
    word: "Bem-vindo!",
    translation: "Welcome!",
    example: "Este é um flashcard de exemplo.",
  };

  // Função para obter o deck padrão
  const getDefaultDeck = () => ({
    id: "NuLCnQtWeMsDkgLNy1cY",
    title: "Geral",
    cover: require("../../../../assets/cover-brain.png"),
    userId: user?.uid,
    profileId: selectedProfile?.id,
  });

  // Garantir que a estrutura de gamificação existe quando o componente carrega
  useEffect(() => {
    if (user?.uid) {
      ensureGamificationStructure(user.uid);
    }
  }, [user?.uid]);

  const resetCounters = () => {
    setReviewedCount(0);
    setFlashcardHistory([]);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSkippedCount(0);
    setCurrentIndex(0);
    setFlipped(true);
    setSelectedOptionIndex(null);
    setStreak(0);
    setMaxStreak(0);
    setShowInstruction(true);
    setAnswerSelected(false);
    isInSession.current = false;
  };

  const handleSelectDeck = (deck) => {
    setSelectedDeck(deck);
    setModalVisible(false);
    resetCounters();
    blockFirestoreUpdates.current = false;
    isInSession.current = false;
    setSessionStartTime(Date.now());
    if (user?.uid) updateDailyStreak(user.uid);
    if (deck && user?.uid && selectedProfile?.id) {
      loadFlashcardsDirectly(deck);
    }
  };

  // Função otimizada para carregar flashcards com limite
  const loadFlashcardsDirectly = async (deck) => {
    try {
      let qFlash;
      if (deck.title === "Geral") {
        qFlash = query(
          collection(db, "flashcards"),
          where("deckId", "==", deck.id),
          where("userId", "==", user.uid),
          where("profileId", "==", selectedProfile.id),
          limit(FLASHCARD_QUERY_LIMIT)
        );
      } else {
        qFlash = query(
          collection(db, "flashcards"),
          where("deckId", "==", deck.id),
          limit(FLASHCARD_QUERY_LIMIT)
        );
      }
      const querySnapshot = await getDocs(qFlash);
      let flashcardsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fallback para decks compartilhados (caso não encontre flashcards)
      if (flashcardsData.length === 0 && deck.originalDeckId) {
        const qOriginal = query(
          collection(db, "flashcards"),
          where("deckId", "==", deck.originalDeckId),
          limit(FLASHCARD_QUERY_LIMIT)
        );
        const origSnapshot = await getDocs(qOriginal);
        flashcardsData = origSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      if (flashcardsData.length === 0) {
        setFlashcards([]);
        setCurrentFlashcard(defaultFlashcard);
        setOptions([]);
        return;
      }

      const shuffledFlashcards = shuffleArray([...flashcardsData]);
      originalShuffledFlashcards.current = shuffledFlashcards;
      setFlashcards(shuffledFlashcards);
      setCurrentFlashcard(shuffledFlashcards[0]);
      generateOptions(shuffledFlashcards[0], shuffledFlashcards);
      isInSession.current = true;
    } catch (error) {
      setFlashcards([]);
      setCurrentFlashcard(defaultFlashcard);
      setOptions([]);
      void 0;
    }
  };

  const handleFlip = () => {
    cardRef.current?.pulse(500);
    setFlipped(!flipped);
    if (showInstruction) setShowInstruction(false);
  };

  // The source showcase uses device vibration instead of audio assets with unverified redistribution rights.
  const playCorrectSound = async () => { Vibration.vibrate(35); };
  const playIncorrectSound = async () => { Vibration.vibrate(250); };

  // Listener otimizado para decks (limpa sempre ao desmontar)
  useEffect(() => {
    if (user && selectedProfile) {
      const decksRef = collection(db, "decks");
      const qDeck = query(
        decksRef,
        where("profileId", "==", selectedProfile.id),
        where("userId", "==", user.uid)
      );
      const unsubscribeDecks = onSnapshot(qDeck, (snapshot) => {
        const decksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const defaultDeck = getDefaultDeck();
        const updatedDecksData = [defaultDeck, ...decksData];
        setDecks(updatedDecksData);
        const isSelectedDeckValid = updatedDecksData.some(
          (dk) => dk.id === selectedDeck?.id
        );
        if (!isSelectedDeckValid && !isInSession.current) {
          setSelectedDeck(defaultDeck);
        }
      });
      return () => {
        unsubscribeDecks();
      };
    }
  }, [selectedProfile?.id, user?.uid]);

  // Listener otimizado para flashcards (limita quantidade e sempre limpa)
  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function fetchFlashcards() {
      try {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        if (selectedDeck && user?.uid && selectedProfile?.id && !isInSession.current) {
          let qFlash;
          if (selectedDeck.title === "Geral") {
            qFlash = query(
              collection(db, "flashcards"),
              where("deckId", "==", selectedDeck.id),
              where("userId", "==", user.uid),
              where("profileId", "==", selectedProfile.id),
              limit(FLASHCARD_QUERY_LIMIT)
            );
          } else {
            qFlash = query(
              collection(db, "flashcards"),
              where("deckId", "==", selectedDeck.id),
              limit(FLASHCARD_QUERY_LIMIT)
            );
          }
          unsubscribe = onSnapshot(qFlash, (querySnapshot) => {
            if (!isMounted) return;
            if (blockFirestoreUpdates.current || isInSession.current) return;
            let flashcardsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            // Fallback para decks compartilhados
            if (flashcardsData.length === 0 && selectedDeck.originalDeckId) {
              getDocs(query(
                collection(db, "flashcards"),
                where("deckId", "==", selectedDeck.originalDeckId),
                limit(FLASHCARD_QUERY_LIMIT)
              )).then(origSnapshot => {
                if (!isMounted) return;
                flashcardsData = origSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                if (flashcardsData.length === 0) {
                  setFlashcards([]);
                  setCurrentFlashcard(defaultFlashcard);
                  setOptions([]);
                  return;
                }
                const shuffledFlashcards = shuffleArray([...flashcardsData]);
                originalShuffledFlashcards.current = shuffledFlashcards;
                setFlashcards(shuffledFlashcards);
                setCurrentFlashcard(shuffledFlashcards[0]);
                generateOptions(shuffledFlashcards[0], shuffledFlashcards);
              });
              return;
            }
            if (flashcardsData.length === 0) {
              setFlashcards([]);
              setCurrentFlashcard(defaultFlashcard);
              setOptions([]);
              return;
            }
            const shuffledFlashcards = shuffleArray([...flashcardsData]);
            originalShuffledFlashcards.current = shuffledFlashcards;
            setFlashcards(shuffledFlashcards);
            setCurrentFlashcard(shuffledFlashcards[0]);
            generateOptions(shuffledFlashcards[0], shuffledFlashcards);
          });
        }
      } catch (error) {
        setFlashcards([]);
        setCurrentFlashcard(defaultFlashcard);
        setOptions([]);
        void 0;
      }
    }

    fetchFlashcards();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [selectedDeck?.id, user?.uid, selectedProfile?.id]);

  useEffect(() => {
    return () => {
      if (selectionTimeout) clearTimeout(selectionTimeout);
    };
  }, [selectionTimeout]);

  useEffect(() => {
    let emergencyTimer = null;
    if (blockFirestoreUpdates.current) {
      emergencyTimer = setTimeout(() => {
        blockFirestoreUpdates.current = false;
      }, 5000);
    }
    return () => {
      if (emergencyTimer) clearTimeout(emergencyTimer);
    };
  }, [showResultModal]);

  useEffect(() => {
    // Sempre que o perfil mudar, reseta o deck selecionado para o padrão
    if (selectedProfile?.id) {
      setSelectedDeck(getDefaultDeck());
      resetCounters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfile?.id]);

  // Função de refresh otimizada
  const onRefresh = () => {
    setRefreshing(true);
    if (selectedDeck) {
      loadFlashcardsDirectly(selectedDeck).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  };

  // Gera 4 opções (1 correta e 3 incorretas)
  const generateOptions = (flashcard, allFlashcards) => {
    setSelectedOptionIndex(null);
    setAnswerSelected(false);
    if (!flashcard || flashcard.id === "default") {
      setOptions([]);
      return;
    }
    const correctOption = flashcard.translation;
    const otherTranslations = allFlashcards
      .filter((fc) => fc.id !== flashcard.id)
      .map((fc) => fc.translation);
    const deckSize = allFlashcards.length; 
    const maxWrong = Math.min(3, deckSize - 1);
    if (maxWrong < 1) {
      setOptions([correctOption]);
      return;
    }
    const randomWrongs = shuffleArray(otherTranslations).slice(0, maxWrong);
    const combinedOptions = shuffleArray([correctOption, ...randomWrongs]);
    setOptions(combinedOptions);
  };

  // Função para embaralhar arrays
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Seleção da opção e verificação automática após 2 segundos
  const handleOptionSelect = (option, index) => {
    // Evitar seleções múltiplas
    if (answerSelected) return;
    
    // Marcar que estamos em uma sessão
    isInSession.current = true;
    
    // Atualizar estados
    setSelectedOptionIndex(index);
    setAnswerSelected(true);
    
    // Limpa qualquer timeout existente
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    
    // Captura o índice selecionado no closure para não perder o valor
    const selectedIdx = index;
    
    // Define um novo timeout de forma mais direta
    const timeout = setTimeout(() => {
      // Usa o índice capturado no closure, não o estado que pode ter mudado
      verifyOptionWithIndex(selectedIdx);
    }, 2000);
    
    // Armazena a referência do timeout
    setSelectionTimeout(timeout);
  };

  // CORRIGIDO: Função verifyOptionWithIndex com manipulação de estado segura
  const verifyOptionWithIndex = async (idx) => {
    try {
      // Bloquear atualizações do Firestore durante a verificação
      blockFirestoreUpdates.current = true;

      // Validações iniciais...
      if (!currentFlashcard || currentFlashcard.id === "default" || idx === null) {
        void 0;
        blockFirestoreUpdates.current = false;
        return;
      }

      // Fazemos uma cópia local para garantir consistência
      const flashcardToCheck = {...currentFlashcard};
      const optionsSnapshot = [...options];
      
      // Verificar resposta
      const selectedOption = optionsSnapshot[idx];
      const isCorrect = selectedOption.trim().toLowerCase() === 
        flashcardToCheck.translation.trim().toLowerCase();

      void 0;

      // Atualizar estados síncronos primeiro
      let newCorrectCount = correctCount;
      let newIncorrectCount = incorrectCount;
      let newStreak = streak;
      let updatedMaxStreak = maxStreak;

      if (isCorrect) {
        newStreak = streak + 1;
        updatedMaxStreak = Math.max(maxStreak, newStreak);
        newCorrectCount = correctCount + 1;
        
        // Efeitos para resposta correta
        setStreak(newStreak);
        setMaxStreak(updatedMaxStreak);
        setCorrectCount(newCorrectCount);
        playCorrectSound();
      } else {
        newStreak = 0;
        newIncorrectCount = incorrectCount + 1;
        
        // Efeitos para resposta incorreta
        setStreak(0);
        setIncorrectCount(newIncorrectCount);
        playIncorrectSound();
        if (shakeRef.current) {
          shakeRef.current.shake(800);
        }
      }

      // Atualizar estado do cartão
      setFlipped(true);

      // Objeto de dados para o próximo cartão
      const nextCardData = {
        correctCount: isCorrect ? newCorrectCount : correctCount,
        incorrectCount: isCorrect ? incorrectCount : newIncorrectCount,
        skippedCount: skippedCount,
        maxStreak: updatedMaxStreak
      };

      // Pequeno delay para animações terminarem antes de avançar
      setTimeout(() => {
        // Avançar para o próximo cartão
        moveToNextFlashcard(
          nextCardData.correctCount, 
          nextCardData.incorrectCount, 
          nextCardData.skippedCount,
          nextCardData.maxStreak
        );

        // Limpar estados de seleção
        setAnswerSelected(false);
        setSelectedOptionIndex(null);
        
        // Operações do Firebase (separadas do fluxo principal para não bloquear a UI)
        if (user?.uid && selectedProfile?.id) {
          try {
            if (isCorrect) {
              incrementFlashcardsCompleted(user.uid, selectedProfile.id);
              incrementFlashcardsCorrect(user.uid, selectedProfile.id);
            } else {
              incrementFlashcardsCompleted(user.uid, selectedProfile.id);
            }

            // Gamificação: Atualizar estatísticas do flashcard
            if (flashcardToCheck.id !== "default") {
              updateFlashcardStats(
                flashcardToCheck.id, 
                isCorrect, 
                user.uid, 
                selectedProfile.id
              );
            }
          } catch (firebaseError) {
            void 0;
          }
        }
        
        // Desbloquear atualizações do Firestore depois de tudo terminar
        setTimeout(() => {
          blockFirestoreUpdates.current = false;
        }, 500);
      }, 500);
    } catch (error) {
      void 0;
      blockFirestoreUpdates.current = false;
    }
  };

  const moveToNextFlashcard = (
    correctCountParam,
    incorrectCountParam,
    skippedCountParam,
    currentMaxStreak = maxStreak
  ) => {
    try {
      const currentFlashcardsArray = [...flashcards];
  
      if (!currentFlashcardsArray || currentFlashcardsArray.length === 0) {
        void 0;
        return;
      }
  
      const nextIndex = currentIndex + 1;
      setReviewedCount((prev) => prev + 1);
  
      if (nextIndex >= currentFlashcardsArray.length) {
        // NOVA PROTEÇÃO: Evita que o modal seja mostrado múltiplas vezes
        if (modalAlreadyShown.current) {
          void 0;
          return;
        }
        
        // Marcar que o modal foi mostrado
        modalAlreadyShown.current = true;
        
        void 0;
        isInSession.current = false;
        blockFirestoreUpdates.current = true;
        
        const timeSpentSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        
        // Definir dados do resultado
        setResultData({
          correctCount: correctCountParam,
          incorrectCount: incorrectCountParam,
          skippedCount: skippedCountParam,
          maxStreak: currentMaxStreak
        });
        
        // PRÉ-PROCESSAMENTO: Fazer chamadas de API antes de mostrar o modal
        if (user?.uid && selectedDeck?.id && sessionStartTime) {
          logDeckCompletion(
            selectedDeck.id,
            user.uid,
            timeSpentSeconds,
            currentFlashcardsArray.length
          );
        }
        
        // Mostrar o modal depois de um delay maior
        setTimeout(() => {
          setShowResultModal(true);
        }, 200); // Aumente para 200ms para dar tempo às operações assíncronas

      } else {
        // Ainda temos flashcards - avançar para o próximo
        // Atualizar histórico com o flashcard atual
        if (currentFlashcard) {
          setFlashcardHistory(prev => [...prev, currentFlashcard]);
        }
        
        // Atualizar índice
        setCurrentIndex(nextIndex);
        
        // Obter próximo flashcard do array atual
        const nextFlashcard = currentFlashcardsArray[nextIndex];
        
        // Atualizar flashcard atual
        setCurrentFlashcard(nextFlashcard);
        
        // Gerar novas opções
        generateOptions(nextFlashcard, currentFlashcardsArray);
      }
    } catch (error) {
      void 0;
      blockFirestoreUpdates.current = false;
    }
  };

  const handleRestartDeck = () => {
   // Verificar se o modal está visível e não está processando
  if (!showResultModal || isProcessing) {
    void 0;
    return;
  }
   // Reset the flag that tracks if modal was shown
   modalAlreadyShown.current = false;
  
   // Limpe qualquer estado potencialmente problemático
   if (selectionTimeout) {
     clearTimeout(selectionTimeout);
     setSelectionTimeout(null);
   }
   
   // Feche o modal primeiro
   setShowResultModal(false);

    // Um pequeno delay para garantir que o UI foi atualizado
    setTimeout(() => {
      resetCounters();
      // Re-embaralhar os flashcards para nova ordem
      if (flashcards.length > 0) {
        const shuffledFlashcards = shuffleArray([...flashcards]);
        originalShuffledFlashcards.current = shuffledFlashcards;
        setFlashcards(shuffledFlashcards);
      
        // Configurar primeiro flashcard
        setCurrentFlashcard(shuffledFlashcards[0]);
        generateOptions(shuffledFlashcards[0], shuffledFlashcards);
      }
      
      // Reiniciar sessão
    setSessionStartTime(Date.now());
    isInSession.current = true;
    blockFirestoreUpdates.current = false; // Certifique-se de que isso seja redefinido
    
      // Iniciar uma nova sessão
      isInSession.current = true;
      
      // Atualizar streak diário
      if (user?.uid) {
        updateDailyStreak(user.uid);
      }
    
    }, 300);
  };

  const handleSkip = async () => {
    // Marcar que estamos em uma sessão
    isInSession.current = true;
    blockFirestoreUpdates.current = true;
    
    // Resetar streak e atualizar skippedCount
    setStreak(0);
    const newSkippedCount = skippedCount + 1;
    setSkippedCount(newSkippedCount);
    
    // Avançar para o próximo flashcard
    moveToNextFlashcard(correctCount, incorrectCount, newSkippedCount);
    
    // Atualizar contador no Firebase
    if (user?.uid && selectedProfile?.id) {
      await incrementFlashcardsCompleted(user.uid, selectedProfile.id);
    }
    
    // Desbloquear atualizações
    setTimeout(() => {
      blockFirestoreUpdates.current = false;
    }, 500);
  };

  const handleBack = () => {
    if (flashcardHistory.length > 0) {
      // Marcar que estamos em uma sessão
      isInSession.current = true;
      blockFirestoreUpdates.current = true;
      
      // Obter flashcard anterior
      const previousFlashcard = flashcardHistory[flashcardHistory.length - 1];
      
      // Atualizar histórico
      setFlashcardHistory(prev => prev.slice(0, -1));
      
      // Atualizar índice
      setCurrentIndex(prev => prev - 1);
      
      // Atualizar flashcard atual
      setCurrentFlashcard(previousFlashcard);
      
      // Gerar novas opções
      generateOptions(previousFlashcard, flashcards);
      
      // Atualizar contagem de revisados
      setReviewedCount(prev => prev - 1);
      
      // Desbloquear atualizações
      setTimeout(() => {
        blockFirestoreUpdates.current = false;
      }, 500);
    } else {
      Alert.alert("Aviso", "Você está no primeiro flashcard.");
    }
  };

  // Verifica se a resposta selecionada é a correta
  const isCorrectAnswer = (option) => {
    return currentFlashcard && option.trim().toLowerCase() === currentFlashcard.translation.trim().toLowerCase();
  };

  // Componente do Modal de Resultados
  const ResultModal = () => (
    <Modal
      transparent={true}
      visible={showResultModal}
      animationType="fade"
      onRequestClose={() => {
        // Não fazer nada quando botão voltar for pressionado
        return true;
      }}
    >
      <View style={localStyles.modalOverlay}>
        <Animatable.View 
          animation="bounceIn" 
          style={localStyles.resultModalContainer}
        >
          <View style={localStyles.resultHeaderContainer}>
            <View style={localStyles.resultIconContainer}>
              <Text style={{fontSize: 44}} >🎉</Text>
            </View>
            <Text style={localStyles.resultHeaderTitle}>Revisão completa!</Text>
            <Text style={localStyles.resultHeaderSubtitle}>
              Você revisou {flashcards.length} flashcards
            </Text>
          </View>
          
          <View style={localStyles.resultStatsContainer}>
            <View style={localStyles.resultStatItem}>
              <View style={localStyles.resultStatIconCorrect}>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </View>
              <View style={localStyles.resultStatTextContainer}>
                <Text style={localStyles.resultStatValue}>{resultData.correctCount}</Text>
                <Text style={localStyles.resultStatLabel}>Acertos</Text>
              </View>
            </View>
            
            <View style={localStyles.resultStatItem}>
              <View style={localStyles.resultStatIconIncorrect}>
                <Ionicons name="close" size={24} color="#fff" />
              </View>
              <View style={localStyles.resultStatTextContainer}>
                <Text style={localStyles.resultStatValue}>{resultData.incorrectCount}</Text>
                <Text style={localStyles.resultStatLabel}>Erros</Text>
              </View>
            </View>
            
            <View style={localStyles.resultStatItem}>
              <View style={localStyles.resultStatIconSkipped}>
                <Ionicons name="play-forward" size={20} color="#fff" />
              </View>
              <View style={localStyles.resultStatTextContainer}>
                <Text style={localStyles.resultStatValue}>{resultData.skippedCount}</Text>
                <Text style={localStyles.resultStatLabel}>Pulados</Text>
              </View>
            </View>
          </View>
          
          {resultData.maxStreak > 1 && (
            <View style={localStyles.streakResultContainer}>
              <View style={localStyles.fireIconContainer}>
                <Text style={{fontSize: 24}}>🔥</Text>
              </View>
              <Text style={localStyles.streakResultText}>
                Maior sequência: <Text style={{fontWeight: 'bold'}}>{resultData.maxStreak}</Text> streaks!
              </Text>
            </View>
          )}

          <View style={localStyles.resultScoreContainer}>
            <Progress.Circle
              size={80}
              progress={flashcards.length > 0 ? resultData.correctCount / flashcards.length : 0}
              color="#F194FF"
              thickness={8}
              unfilledColor="#F194FF30"
              borderWidth={0}
              showsText={true}
              formatText={() => `${Math.round((flashcards.length > 0 ? resultData.correctCount / flashcards.length : 0) * 100)}%`}
              textStyle={localStyles.resultScoreText}
              strokeCap="round"
            />
            <Text style={localStyles.resultScoreLabel}>Taxa de acerto</Text>
          </View>

          <TouchableOpacity 
            style={localStyles.restartButton} 
            onPress={handleRestartDeck}
            disabled={isProcessing} 
          >
            <Ionicons name="reload" size={18} color="#fff" />
            <Text style={localStyles.restartButtonText}>
              {isProcessing ? "Processando..." : "Estudar novamente"}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={localStyles.contentContainer}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header com barra de progresso e navegação */}
      <View style={[styles.viewProgress, localStyles.sectionSpacing]}>
        <View style={localStyles.viewHeaderRow}>
          <TouchableOpacity style={localStyles.buttonBack} onPress={handleBack}>
            <Ionicons name="arrow-back" size={18} color="#666" />
            <Text style={localStyles.buttonText}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.touchblePickerDeck}
            onPress={() => setModalVisible(true)}
          >
            <Text numberOfLines={1} style={styles.textTouchblePickerDeck}>
              {selectedDeck?.title || selectedDeck?.name || "Selecione um deck"}
            </Text>
            <Entypo name="chevron-small-down" size={24} color="#CB48DF" />
          </TouchableOpacity>
          
          <CustomDecks
            decks={decks}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            onSelectDeck={handleSelectDeck}
          />
          
          <TouchableOpacity style={localStyles.buttonSkip} onPress={handleSkip}>
            <Text style={localStyles.buttonSkipText}>Pular</Text>
            <Ionicons name="play-skip-forward" size={18} color="#CB48DF" />
          </TouchableOpacity>
        </View>

        {/* Barra de progresso aprimorada */}
        <View style={localStyles.progressInfoContainer}>
          <View style={localStyles.statsContainer}>
            <View style={localStyles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color="green" />
              <Text style={localStyles.statText}>{correctCount}</Text>
            </View>
            <Text style={localStyles.progressText}>
              {reviewedCount} de {flashcards.length}
            </Text>
            <View style={localStyles.statItem}>
              <Ionicons name="close-circle" size={16} color="red" />
              <Text style={localStyles.statText}>{incorrectCount}</Text>
            </View>
          </View>

          <Progress.Bar
            progress={flashcards.length > 0 ? reviewedCount / flashcards.length : 0}
            width={width * 0.85}
            height={8}
            color="#CB48DF"
            unfilledColor="#eeeeee"
            borderWidth={0}
          />
        </View>
      </View>

      {/* Sequência de acertos */}
      {streak > 1 && (
        <View style={localStyles.streakContainerWrapper}>
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            style={localStyles.streakContainer}
          >
            <Text style={localStyles.streakText}>Streak: {streak} 🔥</Text>
          </Animatable.View>
        </View>
      )}

      {/* Cartão da palavra e flip */}
      <TouchableOpacity
        onPress={handleFlip}
        style={[localStyles.cardWrapper, localStyles.sectionSpacing]}
      >
        <Animatable.View
          ref={(ref) => {
            shakeRef.current = ref;
            cardRef.current = ref;
          }}
          style={[
            styles.card,
            flipped ? localStyles.flippedCard : localStyles.frontCard
          ]}
          animation={flipped ? "fadeInRight" : "fadeInLeft"}
          duration={800}
        >
          <Text style={localStyles.textCard}>
            {flipped ? currentFlashcard?.word : currentFlashcard?.translation}
          </Text>
          
          {/* Indicador visual para flip */}
          <View style={localStyles.flipIndicator}>
            <Ionicons 
              name="repeat" 
              size={20} 
              color="#CB48DF70" 
            />
          </View>
        </Animatable.View>
      </TouchableOpacity>

      {/* Instruções e indicador de cartão */}
      <Text style={[localStyles.instructionText, localStyles.textSpacing]}>
        {showInstruction ? 
          "Toque no cartão para ver a tradução" : 
          `Cartão ${currentIndex + 1} de ${flashcards.length}`
        }
      </Text>

      {/* Dica/Exemplo */}
      {currentFlashcard?.example && (
        <Animatable.View 
          animation="fadeIn" 
          style={[localStyles.exampleContainer, localStyles.sectionSpacing]}
        >
          <Text style={localStyles.exampleLabel}>Exemplo:</Text>
          <Text style={localStyles.exampleText}>{currentFlashcard.example}</Text>
        </Animatable.View>
      )}

      {/* Opções de resposta */}
      {flashcards.length > 0 && currentFlashcard?.id !== "default" && (
        <View style={[localStyles.optionsContainer, localStyles.sectionSpacing]}>
          {options.map((option, index) => {
            const isSelected = selectedOptionIndex === index;
            const isCorrect = isCorrectAnswer(option);
            const showResult = answerSelected; // Resposta foi selecionada
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  localStyles.optionItem,
                  isSelected && localStyles.optionItemSelected,
                  showResult && isSelected && isCorrect && localStyles.correctOption,
                  showResult && isSelected && !isCorrect && localStyles.incorrectOption,
                  showResult && !isSelected && isCorrect && localStyles.revealedCorrectOption
                ]}
                onPress={() => !showResult && handleOptionSelect(option, index)}
                disabled={showResult || isProcessing} // Desabilitar durante processamento
              >
                <Text style={[
                  localStyles.optionText,
                  isSelected && localStyles.optionTextSelected,
                  showResult && isSelected && isCorrect && localStyles.correctOptionText,
                  showResult && isSelected && !isCorrect && localStyles.incorrectOptionText,
                  showResult && !isSelected && isCorrect && localStyles.revealedCorrectOptionText
                ]}>
                  {option}
                </Text>
                {showResult && isSelected && isCorrect && (
                  <Animatable.View animation="bounceIn" style={localStyles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="green" />
                  </Animatable.View>
                )}
                {showResult && isSelected && !isCorrect && (
                  <Animatable.View animation="bounceIn" style={localStyles.iconContainer}>
                    <Ionicons name="close-circle" size={20} color="red" />
                  </Animatable.View>
                )}
                {showResult && !isSelected && isCorrect && (
                  <Animatable.View animation="bounceIn" style={localStyles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="green" />
                  </Animatable.View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Modal de resultados personalizado */}
      <ResultModal />
    </ScrollView>
  );
}
// Os estilos são os mesmos do seu código original, então não estou incluindo aqui para economizar espaço

// Estilos locais aprimorados (sem alteração)
const localStyles = StyleSheet.create({
  contentContainer: {
    alignItems: "center", 
    flexGrow: 1, 
    paddingBottom: 200,
    paddingTop: 16,
  },
  sectionSpacing: {
    marginBottom: 20, // Espaçamento uniforme entre seções
  },
  textSpacing: {
    marginBottom: 12,
  },
  viewHeaderRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // Aumentado para mais espaço
  },
  buttonBack: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  buttonText: {
    color: "#666",
    marginLeft: 4,
  },
  buttonSkip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  buttonSkipText: {
    color: "#CB48DF",
    marginRight: 4,
    fontWeight: "500",
  },
  progressInfoContainer: {
    width: "90%",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10, // Aumentado para mais espaço
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  cardWrapper: {
    width: "90%",
    alignItems: "center",
    marginTop: 16, // Espaço adicional acima
  },
  flippedCard: {
    backgroundColor: "white",
  },
  frontCard: {
    backgroundColor: "#FCE8FF",
  },
  textCard: {
    fontSize: 24,
    fontWeight: "600",
    color: "#212121",
    textAlign: "center",
  },
  flipIndicator: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  instructionText: {
    marginTop: 8,
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
  exampleContainer: {
    width: "90%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12, // Aumentado para mais arredondamento
    padding: 16, // Aumentado para mais espaço interno
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#CB48DF",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#CB48DF",
    marginBottom: 6, // Mais espaço
  },
  exampleText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  streakContainerWrapper: {
    width: '100%', 
    alignItems:'center', 
    position: 'absolute', 
    top: 3, // Posicionado abaixo do header
    zIndex: 100,
  },
  streakContainer: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  streakText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  optionsContainer: {
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 0, // Aumentado para mais espaço
  },
  optionItem: {
    width: "48%",
    marginVertical: 10, // Aumentado para mais espaço entre opções
    backgroundColor: "#f4f4f4",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12, // Aumentado para mais arredondamento
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionItemSelected: {
    backgroundColor: "#F194FF30",
    borderWidth: 1,
    borderColor: "#CB48DF",
  },
  correctOption: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: "green",
    borderWidth: 1,
  },
  incorrectOption: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderColor: "red",
    borderWidth: 1,
  },
  revealedCorrectOption: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "green",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#CB48DF",
    fontWeight: "600",
  },
  correctOptionText: {
    color: "green",
    fontWeight: "600",
  },
  incorrectOptionText: {
    color: "red",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
  revealedCorrectOptionText: {
    color: "green",
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    top: 10,
  },

  // Estilos para o modal de resultados
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  resultHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FCE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  resultHeaderSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resultStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  resultStatItem: {
    alignItems: 'center',
    width: '30%',
  },
  resultStatIconCorrect: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultStatIconIncorrect: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultStatIconSkipped: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9E9E9E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultStatTextContainer: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  resultStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakResultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 24,
  },
  fireIconContainer: {
    marginRight: 10,
  },
  streakResultText: {
    fontSize: 15,
    color: '#212121',
  },
  resultScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultScoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#989898',
  },
  resultScoreLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  restartButton: {
    flexDirection: 'row',
    backgroundColor: '#212121',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});