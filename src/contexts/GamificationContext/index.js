import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  doc, getDoc, collection, query, where, getDocs, updateDoc, 
  increment, serverTimestamp, runTransaction, writeBatch
} from 'firebase/firestore';
import { db } from '../../db/config';
import { AuthContext } from '../AuthContext';
import { ProfileContext } from '../ProfilesContext'; 
import AsyncStorage from "@react-native-async-storage/async-storage";

// Níveis de proficiência - mantidos iguais
export const PROFICIENCY_LEVELS = [
  { level: 1, title: "Iniciante", threshold: 0 },
  { level: 2, title: "Aprendiz", threshold: 100 },
  { level: 3, title: "Básico", threshold: 500 },
  { level: 4, title: "Intermediário", threshold: 1000 },
  { level: 5, title: "Avançado", threshold: 3000 },
  { level: 6, title: "Fluente", threshold: 5000 },
  { level: 7, title: "Proficiente", threshold: 7500 },
  { level: 8, title: "Nativo", threshold: 15000 } 
];

const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutos
const GamificationContext = createContext({});

export const GamificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext);
  const [userLevel, setUserLevel] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [studyStreak, setStudyStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Refs para otimização
  const lastUpdateTime = useRef({});
  const userStatsCache = useRef({});
  const deckStatsCache = useRef({});
  const pendingUpdates = useRef([]);
  const updateTimeout = useRef(null);
  
  // Limpar caches quando o perfil mudar
  useEffect(() => {
    if (selectedProfile?.id) {
      userStatsCache.current = {};
      deckStatsCache.current = {};
      lastUpdateTime.current = {};
    }
  }, [selectedProfile?.id]);

  // Processar atualizações em batch após um período de inatividade
  useEffect(() => {
    const processPendingUpdates = async () => {
      if (pendingUpdates.current.length === 0 || !user) return;
      
      try {
        const batch = writeBatch(db);
        const updates = [...pendingUpdates.current];
        pendingUpdates.current = [];
        
        updates.forEach(({ref, data}) => {
          batch.update(ref, data);
        });
        
        await batch.commit();
        void 0;
      } catch (error) {
        void 0;
      }
    };
    
    // Limpar timeout anterior
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    
    // Definir novo timeout para processar atualizações
    if (pendingUpdates.current.length > 0) {
      updateTimeout.current = setTimeout(processPendingUpdates, 2000);
    }
    
    // Limpar na desmontagem
    return () => {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
    };
  }, [pendingUpdates.current.length, user]);
  
  // Função auxiliar para update com batching
  const queueUpdate = (docRef, updateData) => {
    pendingUpdates.current.push({ref: docRef, data: updateData});
    
    // Se acumularmos muitas atualizações, processe imediatamente
    if (pendingUpdates.current.length >= 10 && updateTimeout.current) {
      clearTimeout(updateTimeout.current);
      updateTimeout.current = setTimeout(() => {
        const processPendingUpdates = async () => {
          if (pendingUpdates.current.length === 0 || !user) return;
          
          try {
            const batch = writeBatch(db);
            const updates = [...pendingUpdates.current];
            pendingUpdates.current = [];
            
            updates.forEach(({ref, data}) => {
              batch.update(ref, data);
            });
            
            await batch.commit();
            void 0;
          } catch (error) {
            void 0;
          }
        };
        processPendingUpdates();
      }, 100);
    }
  };
  
  // Carregar dados de gamificação com cache
  useEffect(() => {
    if (!user || !selectedProfile) {
      setLoading(false);
      return;
    }
    
    const loadUserGamification = async () => {
      try {
        setLoading(true);
        
        // Tentar carregar do cache primeiro
        const cacheKey = `gamification_${user.uid}_${selectedProfile.id}`;
        const cachedData = await AsyncStorage.getItem(cacheKey);
        
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          // Usar cache se tiver menos de 30 min
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            void 0;
            setUserLevel(data);
            setStudyStreak(data.streak || 0);
            setLoading(false);
            
            // Carregar do Firestore em background para atualizar o cache
            setTimeout(() => loadFromFirestore(cacheKey), 1000);
            return;
          }
        }
        
        // Se não há cache válido, carregar do Firestore
        await loadFromFirestore(cacheKey);
        
      } catch (error) {
        void 0;
        setLoading(false);
      }
    };
    
    const loadFromFirestore = async (cacheKey) => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data() || {};
        
        // Verificar se temos uma estrutura de gamificação
        let gamificationData = userData.gamification || {};
        
        // Verificar se temos dados para este perfil específico
        if (!gamificationData.profiles) {
          // Migrar dados antigos para o novo formato se existirem
          if (gamificationData.level) {
            void 0;
            
            gamificationData = {
              selectedProfileId: selectedProfile.id,
              profiles: {
                [selectedProfile.id]: {
                  level: gamificationData.level,
                  title: gamificationData.title,
                  totalCardsWithHighRetention: gamificationData.totalCardsWithHighRetention || 0,
                  cardsNeededForNextLevel: gamificationData.cardsNeededForNextLevel || PROFICIENCY_LEVELS[1].threshold,
                  progress: gamificationData.progress || 0,
                  streak: gamificationData.streak || 0,
                  lastStudyDate: gamificationData.lastStudyDate || null,
                  totalStudySessions: gamificationData.totalStudySessions || 0,
                  studyTime: gamificationData.studyTime || 0
                }
              }
            };
            
            await updateDoc(userDocRef, { gamification: gamificationData });
          } else {
            // Inicializar estrutura vazia
            gamificationData = {
              selectedProfileId: selectedProfile.id,
              profiles: {}
            };
            await updateDoc(userDocRef, { gamification: gamificationData });
          }
        }
        
        // Atualizar o perfil selecionado
        if (gamificationData.selectedProfileId !== selectedProfile.id) {
          queueUpdate(userDocRef, {
            'gamification.selectedProfileId': selectedProfile.id
          });
          gamificationData.selectedProfileId = selectedProfile.id;
        }
        
        // Carregar ou inicializar dados do perfil selecionado
        let profileGamification = gamificationData.profiles?.[selectedProfile.id];
        
        if (!profileGamification) {
          // Inicializar dados para este perfil
          profileGamification = {
            level: 1,
            title: "Iniciante",
            totalCardsWithHighRetention: 0,
            cardsNeededForNextLevel: PROFICIENCY_LEVELS[1].threshold,
            progress: 0,
            streak: 0,
            lastStudyDate: null,
            totalStudySessions: 0,
            studyTime: 0
          };
          
          // Salvar os dados iniciais
          queueUpdate(userDocRef, {
            [`gamification.profiles.${selectedProfile.id}`]: profileGamification
          });
        }

        // Correção para valor incorreto
        if (profileGamification.cardsNeededForNextLevel === 51 && profileGamification.level === 1) {
          profileGamification.cardsNeededForNextLevel = PROFICIENCY_LEVELS[1].threshold;
          
          queueUpdate(userDocRef, {
            [`gamification.profiles.${selectedProfile.id}.cardsNeededForNextLevel`]: PROFICIENCY_LEVELS[1].threshold
          });
        }
        
        // Salvar no cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: profileGamification,
          timestamp: Date.now()
        }));
                
        // Atualizar o estado
        setUserLevel(profileGamification);
        setStudyStreak(profileGamification.streak || 0);
        setLoading(false);
      } catch (error) {
        void 0;
        setLoading(false);
      }
    };
    
    loadUserGamification();
  }, [user, selectedProfile]); 
  
  // OTIMIZADO: Função para atualizar estatísticas do flashcard
  const updateFlashcardStats = async (flashcardId, isCorrect) => {
    if (!user || !selectedProfile) return null;
    
    try {
      const flashcardRef = doc(db, 'flashcards', flashcardId);
      
      // Usar transação para operações atômicas
      return await runTransaction(db, async (transaction) => {
        const flashcardDoc = await transaction.get(flashcardRef);
        
        if (!flashcardDoc.exists()) {
          void 0;
          return null;
        }
        
        const flashcardData = flashcardDoc.data();
        
        // Verificar se o flashcard pertence ao perfil selecionado
        if (flashcardData.profileId !== selectedProfile.id) {
          void 0;
          return null;
        }
        
        // Se não existir stats, inicializa
        const stats = flashcardData.stats || {
          attempts: 0,
          correctAnswers: 0,
          retention: 0,
          highRetentionAchieved: false,
          lastStudied: null
        };
        
        // Atualiza as estatísticas
        const newAttempts = stats.attempts + 1;
        const newCorrectAnswers = stats.correctAnswers + (isCorrect ? 1 : 0);
        const newRetention = Math.round((newCorrectAnswers / newAttempts) * 100);
        const wasHighRetention = stats.highRetentionAchieved;
        const isHighRetention = newRetention >= 80 && newAttempts >= 5;
        
        // Novos stats
        const newStats = {
          attempts: newAttempts,
          correctAnswers: newCorrectAnswers,
          retention: newRetention,
          highRetentionAchieved: isHighRetention,
          lastStudied: serverTimestamp()
        };
        
        // Atualiza o documento dentro da transação
        transaction.update(flashcardRef, { stats: newStats });
        
        // Se atingiu alta retenção pela primeira vez, atualiza contadores
        if (!wasHighRetention && isHighRetention) {
          // Referências para atualização
          const deckRef = doc(db, 'decks', flashcardData.deckId);
          const userRef = doc(db, 'users', user.uid);
          
          // Atualização no deck - incrementa o contador em vez de recalcular
          transaction.update(deckRef, {
            'stats.cardsWithHighRetention': increment(1)
          });
          
          // Atualização no perfil - incrementa o contador em vez de recalcular
          transaction.update(userRef, {
            [`gamification.profiles.${selectedProfile.id}.totalCardsWithHighRetention`]: increment(1)
          });
          
          // Sinalizar necessidade de recálculo menos frequente
          setTimeout(() => {
            updateUserLevelLocal(userRef, true);
          }, 100);
        }
        
        return newStats;
      });
    } catch (error) {
      void 0;
      return null;
    }
  };
  
  // OTIMIZADO: Função para atualizar estatísticas do deck sem consultar todos os flashcards
  const updateDeckStats = async (deckId) => {
    if (!selectedProfile) return null;
    
    // Verificar cache para reduzir consultas
    const cacheKey = `deck_${deckId}`;
    const now = Date.now();
    
    if (
      deckStatsCache.current[cacheKey] &&
      now - lastUpdateTime.current[cacheKey] < 60000 // 1 minuto
    ) {
      return deckStatsCache.current[cacheKey];
    }
    
    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);
      
      if (!deckDoc.exists()) {
        void 0;
        return null;
      }
      
      const deckData = deckDoc.data();
      
      // Verificar se o deck pertence ao perfil selecionado
      if (deckData.profileId !== selectedProfile.id) {
        void 0;
        return null;
      }
      
      // OTIMIZAÇÃO: Usar contadores incrementais em vez de consultar todos os flashcards
      // Consulta apenas para contar total de flashcards (não carrega os documentos completos)
      const countQuery = query(
        collection(db, 'flashcards'),
        where('deckId', '==', deckId)
      );
      
      const countSnapshot = await getDocs(countQuery);
      const totalCards = countSnapshot.size;
      
      // Consulta eficiente para cards estudados
      const studiedQuery = query(
        collection(db, 'flashcards'),
        where('deckId', '==', deckId),
        where('stats.attempts', '>', 0)
      );
      
      const highRetentionQuery = query(
        collection(db, 'flashcards'),
        where('deckId', '==', deckId),
        where('stats.highRetentionAchieved', '==', true)
      );
      
      // Executar consultas em paralelo
      const [studiedSnapshot, highRetentionSnapshot] = await Promise.all([
        getDocs(studiedQuery),
        getDocs(highRetentionQuery)
      ]);
      
      const studiedCards = studiedSnapshot.size;
      const cardsWithHighRetention = highRetentionSnapshot.size;
      
      // Cálculo simplificado de retenção geral
      let totalRetention = 0;
      
      studiedSnapshot.forEach(doc => {
        const data = doc.data();
        totalRetention += data.stats?.retention || 0;
      });
      
      const overallRetention = studiedCards > 0 ? Math.round(totalRetention / studiedCards) : 0;
      const completionPercentage = totalCards > 0 ? Math.round((cardsWithHighRetention / totalCards) * 100) : 0;
      
      const stats = {
        totalCards,
        studiedCards,
        cardsWithHighRetention,
        overallRetention,
        completionPercentage,
        lastUpdated: serverTimestamp()
      };
      
      // Atualizar documento do deck
      queueUpdate(deckRef, { stats });
      
      // Atualizar cache
      deckStatsCache.current[cacheKey] = stats;
      lastUpdateTime.current[cacheKey] = now;
      
      return stats;
    } catch (error) {
      void 0;
      return null;
    }
  };
  
  // Função otimizada para não consultar todos os flashcards repetidamente
  const updateUserLevelLocal = async (userRef = null, forceUpdate = false) => {
    if (!user || !selectedProfile) return null;
    
    // Verificar cache para evitar chamadas frequentes
    const cacheKey = `user_${user.uid}_${selectedProfile.id}`;
    const now = Date.now();
    
    if (
      !forceUpdate &&
      userStatsCache.current[cacheKey] &&
      now - lastUpdateTime.current[cacheKey] < 30000 // 30 segundos
    ) {
      return userStatsCache.current[cacheKey];
    }
    
    try {
      // Obter referência ao documento do usuário
      if (!userRef) {
        userRef = doc(db, 'users', user.uid);
      }
      
      // Obter dados do usuário
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};
      
      // Obter dados do perfil específico
      const profileData = userData.gamification?.profiles?.[selectedProfile.id];
      
      if (!profileData) return null;
      
      // Usar o contador incremental em vez de recontar todos os flashcards
      const totalCardsWithHighRetention = profileData.totalCardsWithHighRetention || 0;
      
      // Determina o nível atual com base nos cards dominados
      const currentLevelData = [...PROFICIENCY_LEVELS]
        .reverse()
        .find(level => totalCardsWithHighRetention >= level.threshold);
      
      // Encontra o próximo nível
      const currentLevelIndex = PROFICIENCY_LEVELS.findIndex(
        level => level.level === currentLevelData.level
      );
      
      // Calcular progresso e cards necessários
      let progress = 0;
      let cardsNeededForNextLevel = 0;
      
      if (currentLevelIndex < PROFICIENCY_LEVELS.length - 1) {
        const nextLevel = PROFICIENCY_LEVELS[currentLevelIndex + 1];
        const rangeForLevel = nextLevel.threshold - currentLevelData.threshold;
        const progressInRange = totalCardsWithHighRetention - currentLevelData.threshold;
        
        progress = Math.min(Math.floor((progressInRange / rangeForLevel) * 100), 99);
        progress = Math.max(0, progress);
        
        cardsNeededForNextLevel = Math.max(0, nextLevel.threshold - totalCardsWithHighRetention);
      } else {
        progress = 100;
        cardsNeededForNextLevel = 0;
      }
      
      // Verificar se o nível mudou para detectar "level up"
      const oldLevel = profileData.level || 0;
      const levelUp = currentLevelData.level > oldLevel;
      
      // Criar novos dados para o perfil
      const newProfileData = {
        level: currentLevelData.level,
        title: currentLevelData.title,
        totalCardsWithHighRetention,
        cardsNeededForNextLevel,
        progress,
        // Manter outros dados
        streak: profileData.streak || 0,
        lastStudyDate: profileData.lastStudyDate || null,
        totalStudySessions: profileData.totalStudySessions || 0,
        studyTime: profileData.studyTime || 0
      };
      
      // Atualizar documento apenas se houver mudança de nível
      if (levelUp || forceUpdate) {
        queueUpdate(userRef, {
          [`gamification.profiles.${selectedProfile.id}`]: newProfileData
        });
        
        // Atualizar cache
        const cacheKey = `gamification_${user.uid}_${selectedProfile.id}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: newProfileData,
          timestamp: Date.now()
        }));
      }
      
      // Atualizar estado local
      if (levelUp) {
        setShowLevelUp(true);
      }
      
      setUserLevel(newProfileData);
      
      // Atualizar cache interno
      userStatsCache.current[cacheKey] = { levelData: newProfileData, levelUp };
      lastUpdateTime.current[cacheKey] = now;
      
      return { levelData: newProfileData, levelUp };
    } catch (error) {
      void 0;
      return null;
    }
  };
  
  // Função para forçar recálculo completo do nível (uso menos frequente)
  const updateUserLevel = async () => {
    if (!user || !selectedProfile) return null;
    
    try {
      // Buscar a contagem atual em vez de todos os documentos
      const countQuery = query(
        collection(db, 'flashcards'),
        where('userId', '==', user.uid),
        where('profileId', '==', selectedProfile.id),
        where('stats.highRetentionAchieved', '==', true)
      );
      
      // Usar apenas para contar (não carrega os documentos completos)
      const countSnapshot = await getDocs(countQuery);
      const totalCardsWithHighRetention = countSnapshot.size;
      
      // Obter referência ao documento do usuário
      const userRef = doc(db, 'users', user.uid);
      
      // Atualizar o contador no perfil
      await updateDoc(userRef, {
        [`gamification.profiles.${selectedProfile.id}.totalCardsWithHighRetention`]: totalCardsWithHighRetention
      });
      
      // Atualizar nível com base na contagem corrigida
      return await updateUserLevelLocal(userRef, true);
    } catch (error) {
      void 0;
      return null;
    }
  };
  
  // Otimizado para minimizar leituras
  const updateUserStreak = async () => {
    if (!user || !selectedProfile) return 0;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};
      
      // Obter dados de gamificação atuais do perfil
      const currentProfileData = userData.gamification?.profiles?.[selectedProfile.id] || {};
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      // Lidar com diferentes formatos de timestamp
      let lastStudyDate = null;
      if (currentProfileData.lastStudyDate) {
        if (currentProfileData.lastStudyDate.toDate) {
          lastStudyDate = currentProfileData.lastStudyDate.toDate();
        } else if (currentProfileData.lastStudyDate.seconds) {
          lastStudyDate = new Date(currentProfileData.lastStudyDate.seconds * 1000);
        } else if (currentProfileData.lastStudyDate instanceof Date) {
          lastStudyDate = currentProfileData.lastStudyDate;
        }
      }
      
      const lastStudyDay = lastStudyDate 
        ? new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate()).getTime()
        : null;
      
      let newStreak = currentProfileData.streak || 0;
      
      // Calculando streak como antes
      if (!lastStudyDay) {
        newStreak = 1;
      } else if (lastStudyDay === today) {
        // Verifica se já atualizamos o streak hoje - evita leituras/escritas desnecessárias
        return newStreak;
      } else if (today - lastStudyDay === 86400000) {
        newStreak += 1;
      } else if (today - lastStudyDay > 86400000) {
        newStreak = 1;
      }
      
      // Usando update em batch para minimizar chamadas
      const updateData = {
        [`gamification.profiles.${selectedProfile.id}.streak`]: newStreak,
        [`gamification.profiles.${selectedProfile.id}.lastStudyDate`]: serverTimestamp(),
        [`gamification.profiles.${selectedProfile.id}.totalStudySessions`]: increment(1)
      };
      
      queueUpdate(userRef, updateData);
      
      // Atualizar estado local
      setStudyStreak(newStreak);
      
      // Atualizar cache do nível
      if (userLevel) {
        const updatedLevel = {
          ...userLevel,
          streak: newStreak,
          lastStudyDate: new Date(),
          totalStudySessions: (userLevel.totalStudySessions || 0) + 1
        };
        
        // Atualizar cache
        const cacheKey = `gamification_${user.uid}_${selectedProfile.id}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: updatedLevel,
          timestamp: Date.now()
        }));
        
        // Atualizar estado
        setUserLevel(updatedLevel);
      }
      
      return newStreak;
    } catch (error) {
      void 0;
      return 0;
    }
  };
  
  // Iniciar sessão com menos consultas
  const startStudySession = async () => {
    if (!user || !selectedProfile) return 0;
    
    try {
      const streak = await updateUserStreak();
      return streak;
    } catch (error) {
      void 0;
      return 0;
    }
  };
  
  // Registrar resultado com gatilho inteligente
  const recordFlashcardResult = async (flashcardId, isCorrect) => {
    if (!user || !selectedProfile) return null;
    
    try {
      const newStats = await updateFlashcardStats(flashcardId, isCorrect);
      
      // A atualização do nível agora é feita dentro da transação quando necessário
      // Se o card acabou de atingir alta retenção e o level-up ainda não foi notificado
      if (newStats && newStats.highRetentionAchieved && newStats.attempts === 5) {
        // Aqui não precisamos chamar updateUserLevel porque já foi feito na transação
        // Apenas verificamos o estado local para exibição
        if (userLevel) {
          // Verificar se já evoluímos para informar o usuário
          const updatedLevel = await updateUserLevelLocal();
          
          if (updatedLevel && updatedLevel.levelUp) {
            setShowLevelUp(true);
          }
        }
      }
      
      return newStats;
    } catch (error) {
      void 0;
      return null;
    }
  };
  
  // Atualizar tempo de estudo de forma otimizada
  const updateStudyTime = async (minutes) => {
    if (!user || !selectedProfile) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Usar queueUpdate para batching
      queueUpdate(userRef, {
        [`gamification.profiles.${selectedProfile.id}.studyTime`]: increment(minutes)
      });
      
      // Atualizar estado local imediatamente
      setUserLevel(prev => ({
        ...prev,
        studyTime: (prev?.studyTime || 0) + minutes
      }));
      
      // Atualizar cache
      if (userLevel) {
        const updatedLevel = {
          ...userLevel,
          studyTime: (userLevel.studyTime || 0) + minutes
        };
        
        const cacheKey = `gamification_${user.uid}_${selectedProfile.id}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: updatedLevel,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      void 0;
    }
  };
  
  // Otimizado com cache
  const getProfilesSummary = async () => {
    if (!user) return [];
    
    const cacheKey = `profiles_summary_${user.uid}`;
    
    try {
      // Verificar cache
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Usar cache se for recente (5 minutos)
        if (Date.now() - timestamp < 300000) {
          return data;
        }
      }
      
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return [];
      
      const userData = userDoc.data();
      const profiles = userData.gamification?.profiles || {};
      
      // Buscar informações completas dos perfis uma única vez
      const profilesRef = collection(db, 'profiles');
      const profilesSnapshot = await getDocs(profilesRef);
      
      const profilesData = {};
      profilesSnapshot.forEach(doc => {
        profilesData[doc.id] = {
          id: doc.id,
          ...doc.data()
        };
      });
      
      // Combinar dados
      const result = Object.entries(profiles).map(([profileId, gamificationData]) => ({
        id: profileId,
        language: profilesData[profileId]?.language || 'Desconhecido',
        flagUrl: profilesData[profileId]?.flagUrl || null,
        gamification: gamificationData,
        isActive: profileId === selectedProfile?.id
      }));
      
      // Salvar no cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      
      return result;
    } catch (error) {
      void 0;
      return [];
    }
  };
  
  return (
    <GamificationContext.Provider
      value={{
        userLevel,
        studyStreak,
        showLevelUp,
        setShowLevelUp,
        loading,
        selectedProfile,
        startStudySession,
        recordFlashcardResult,
        updateStudyTime,
        updateFlashcardStats,
        updateDeckStats,
        updateUserLevel,
        getProfilesSummary,
        proficiencyLevels: PROFICIENCY_LEVELS
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification deve ser usado dentro de um GamificationProvider');
  }
  return context;
};