import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  writeBatch, 
  orderBy, 
  limit, 
  startAfter 
} from 'firebase/firestore';
import { db, auth } from '../../db/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função principal de migração
export const RunMigrations = async () => {
  try {
    // Verificar se a migração já foi executada
    const migrationDone = await AsyncStorage.getItem('@gamificationMigration');
    if (migrationDone === 'true') {
      void 0;
      return { success: true, message: 'Migração já concluída' };
    }

    // Executar as migrações
    await migrateUsers();
    await migrateDecks();
    await migrateFlashcards();

    // Marcar migração como concluída
    await AsyncStorage.setItem('@gamificationMigration', 'true');
    
    return { success: true, message: 'Migração concluída com sucesso' };
  } catch (error) {
    void 0;
    return { success: false, message: error.message };
  }
};

// Migrar dados de usuários
const migrateUsers = async () => {
  void 0;
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    void 0;
    return;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Verificar se já existe gamification no formato antigo ou novo
      if (!userData.gamification) {
        void 0;
        
        // Buscar perfis usados pelo usuário
        let activeProfileId = null;
        
        // 1. Tentar obter perfil ativo do usuário, se já estiver definido
        if (userData.activeProfile || userData.selectedProfile) {
          activeProfileId = userData.activeProfile || userData.selectedProfile;
          void 0;
        } 
        // 2. Se não houver perfil ativo, buscar perfil mais usado em decks
        else {
          void 0;
          
          const decksQuery = query(
            collection(db, 'decks'),
            where('userId', '==', userId)
          );
          
          const decksSnapshot = await getDocs(decksQuery);
          const profileCounts = {};
          
          decksSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.profileId) {
              profileCounts[data.profileId] = (profileCounts[data.profileId] || 0) + 1;
            }
          });
          
          // Encontrar perfil com mais decks
          let maxCount = 0;
          for (const [profileId, count] of Object.entries(profileCounts)) {
            if (count > maxCount) {
              maxCount = count;
              activeProfileId = profileId;
            }
          }
          
          if (activeProfileId) {
            void 0;
          }
        }
        
        // 3. Se ainda não tivermos perfil, buscar qualquer perfil disponível
        if (!activeProfileId) {
          void 0;
          
          const profilesSnapshot = await getDocs(collection(db, 'profiles'));
          if (!profilesSnapshot.empty) {
            activeProfileId = profilesSnapshot.docs[0].id;
            void 0;
          }
        }
        
        if (!activeProfileId) {
          void 0;
        }
        
        // Criar estrutura de gamificação por perfil
        const newGamification = {
          selectedProfileId: activeProfileId,
          profiles: {}
        };
        
        // Adicionar dados para o perfil ativo, se existir
        if (activeProfileId) {
          newGamification.profiles[activeProfileId] = {
            level: 1,
            title: "Iniciante",
            totalCardsWithHighRetention: 0,
            cardsNeededForNextLevel: 100,
            progress: 0,
            streak: 0,
            lastStudyDate: null,
            totalStudySessions: 0,
            studyTime: 0
          };
        }
        
        // Atualizar documento do usuário
        await updateDoc(userDocRef, {
          gamification: newGamification,
          selectedProfile: activeProfileId // Para compatibilidade com sistema existente
        });
        
        // Verificar se a atualização foi bem-sucedida
        const verifyDoc = await getDoc(userDocRef);
        if (verifyDoc.exists() && verifyDoc.data().gamification) {
          void 0;
        } else {
          void 0;
        }
      } 
      // Migrar formato antigo para novo formato por perfil
      else if (userData.gamification.level && !userData.gamification.profiles) {
        void 0;
        
        // Determinar perfil ativo
        let activeProfileId = userData.selectedProfile || userData.activeProfile;
        
        // Se não tivermos perfil ativo, buscar um
        if (!activeProfileId) {
          // Buscar perfil mais usado em decks
          const decksQuery = query(
            collection(db, 'decks'),
            where('userId', '==', userId)
          );
          
          const decksSnapshot = await getDocs(decksQuery);
          const profileCounts = {};
          
          decksSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.profileId) {
              profileCounts[data.profileId] = (profileCounts[data.profileId] || 0) + 1;
            }
          });
          
          // Encontrar perfil com mais decks
          let maxCount = 0;
          for (const [profileId, count] of Object.entries(profileCounts)) {
            if (count > maxCount) {
              maxCount = count;
              activeProfileId = profileId;
            }
          }
          
          // Se ainda não tivermos perfil, buscar qualquer perfil disponível
          if (!activeProfileId) {
            const profilesSnapshot = await getDocs(collection(db, 'profiles'));
            if (!profilesSnapshot.empty) {
              activeProfileId = profilesSnapshot.docs[0].id;
            }
          }
        }
        
        if (!activeProfileId) {
          void 0;
          return;
        }
        
        // Extrair dados antigos
        const oldGamification = userData.gamification;
        
        // Criar nova estrutura
        const newGamification = {
          selectedProfileId: activeProfileId,
          profiles: {
            [activeProfileId]: {
              level: oldGamification.level || 1,
              title: oldGamification.title || "Iniciante",
              totalCardsWithHighRetention: oldGamification.totalCardsWithHighRetention || 0,
              cardsNeededForNextLevel: oldGamification.cardsNeededForNextLevel || 100,
              progress: oldGamification.progress || 0,
              streak: oldGamification.streak || 0,
              lastStudyDate: oldGamification.lastStudyDate || null,
              totalStudySessions: oldGamification.totalStudySessions || 0,
              studyTime: oldGamification.studyTime || 0
            }
          }
        };
        
        // Atualizar documento
        await updateDoc(userDocRef, {
          gamification: newGamification,
          selectedProfile: activeProfileId
        });
        
        void 0;
      } else {
        void 0;
      }
    } else {
      void 0;
    }
  } catch (error) {
    void 0;
    throw error; // Relançar erro para ser tratado no RunMigrations
  }
};

// Migrar decks do usuário atual
const migrateDecks = async () => {
  void 0;
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    void 0;
    return;
  }

  const decksQuery = query(
    collection(db, 'decks'),
    where('userId', '==', userId)
  );
  const decksSnapshot = await getDocs(decksQuery);

  let batch = writeBatch(db);
  let count = 0;

  for (const deckDoc of decksSnapshot.docs) {
    if (!deckDoc.data().stats) {
      // Contar flashcards para este deck
      const flashcardsQuery = query(
        collection(db, 'flashcards'),
        where('deckId', '==', deckDoc.id)
      );
      const flashcardsSnapshot = await getDocs(flashcardsQuery);

      batch.update(doc(db, 'decks', deckDoc.id), {
        stats: {
          totalCards: flashcardsSnapshot.size,
          studiedCards: 0,
          cardsWithHighRetention: 0,
          overallRetention: 0,
          completionPercentage: 0
        }
      });
      
      count++;
      
      // Commit batch a cada 500 operações para evitar limites do Firestore
      if (count % 500 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    }
  }

  if (count % 500 !== 0 && count > 0) {
    await batch.commit();
  }

  void 0;
};

// Migrar flashcards
const migrateFlashcards = async () => {
  void 0;
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    void 0;
    return;
  }

  // Processar em páginas para evitar estouro de memória e limites do Firestore
  let lastDocSnapshot = null;
  let processedCount = 0;
  const batchSize = 200;
  
  while (true) {
    let flashcardsQuery;
    
    if (lastDocSnapshot) {
      flashcardsQuery = query(
        collection(db, 'flashcards'),
        where('userId', '==', userId),
        orderBy('createdAt'),
        startAfter(lastDocSnapshot),
        limit(batchSize)
      );
    } else {
      flashcardsQuery = query(
        collection(db, 'flashcards'),
        where('userId', '==', userId),
        orderBy('createdAt'),
        limit(batchSize)
      );
    }
    
    const snapshot = await getDocs(flashcardsQuery);
    
    if (snapshot.empty) {
      break;
    }
    
    let batch = writeBatch(db);
    let batchCount = 0;
    
    snapshot.forEach(document => {
      const data = document.data();
      if (!data.stats) {
        batch.update(doc(db, 'flashcards', document.id), {
          stats: {
            attempts: 0,
            correctAnswers: 0,
            retention: 0,
            highRetentionAchieved: false,
            lastStudied: null
          }
        });
        batchCount++;
      }
    });
    
    if (batchCount > 0) {
      await batch.commit();
    }
    
    processedCount += snapshot.size;
    lastDocSnapshot = snapshot.docs[snapshot.size - 1];
    
    if (snapshot.size < batchSize) {
      break;
    }
  }
  
  void 0;
};

// Função auxiliar para calcular estatísticas gerais do usuário
export const recalculateUserStats = async () => {
  void 0;
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    void 0;
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      void 0;
      return false;
    }
    
    const userData = userDoc.data();
    
    // Verificar se temos a estrutura de gamificação por perfil
    if (!userData.gamification?.profiles) {
      void 0;
      return false;
    }
    
    // Obter perfil ativo
    const activeProfileId = userData.gamification.selectedProfileId || 
                           userData.selectedProfile;
    
    if (!activeProfileId) {
      void 0;
      return false;
    }
    
    // Buscar flashcards com alta retenção para o perfil ativo
    const flashcardsQuery = query(
      collection(db, 'flashcards'),
      where('userId', '==', userId),
      where('profileId', '==', activeProfileId),
      where('stats.highRetentionAchieved', '==', true)
    );
    
    const flashcardsSnapshot = await getDocs(flashcardsQuery);
    const totalCardsWithHighRetention = flashcardsSnapshot.size;
    
    // Determinar nível com base nos cards dominados
    let currentLevel = 1;
    let currentTitle = "Iniciante";
    let threshold = 0;
    let nextThreshold = 100;
    
    const LEVELS = [
      { level: 1, title: "Iniciante", threshold: 0 },
      { level: 2, title: "Aprendiz", threshold: 100 },
      { level: 3, title: "Básico", threshold: 500 },
      { level: 4, title: "Intermediário", threshold: 1000 },
      { level: 5, title: "Avançado", threshold: 3000 },
      { level: 6, title: "Fluente", threshold: 5000 },
      { level: 7, title: "Proficiente", threshold: 7500 },
      { level: 8, title: "Nativo", threshold: 15000 } 
    ];
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalCardsWithHighRetention >= LEVELS[i].threshold) {
        currentLevel = LEVELS[i].level;
        currentTitle = LEVELS[i].title;
        threshold = LEVELS[i].threshold;
        nextThreshold = i < LEVELS.length - 1 ? LEVELS[i+1].threshold : threshold;
        break;
      }
    }
    
    // Calcular progresso e cards necessários para o próximo nível
    let progress = 0;
    let cardsNeededForNextLevel = 0;
    
    if (currentLevel < LEVELS.length) {
      const rangeForLevel = nextThreshold - threshold;
      const progressInRange = totalCardsWithHighRetention - threshold;
      progress = Math.min(Math.floor((progressInRange / rangeForLevel) * 100), 99);
      cardsNeededForNextLevel = nextThreshold - totalCardsWithHighRetention;
    } else {
      // Nível máximo
      progress = 100;
      cardsNeededForNextLevel = 0;
    }
    
    // Preservar outros dados existentes
    const currentProfileData = userData.gamification.profiles[activeProfileId] || {};
    
    // Atualizar dados do perfil
    await updateDoc(userDocRef, {
      [`gamification.profiles.${activeProfileId}`]: {
        level: currentLevel,
        title: currentTitle,
        totalCardsWithHighRetention,
        cardsNeededForNextLevel,
        progress,
        // Manter outros dados
        streak: currentProfileData.streak || 0,
        lastStudyDate: currentProfileData.lastStudyDate || null,
        totalStudySessions: currentProfileData.totalStudySessions || 0,
        studyTime: currentProfileData.studyTime || 0
      }
    });
    
    void 0;
    return true;
  } catch (error) {
    void 0;
    return false;
  }
};