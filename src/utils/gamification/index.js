import firestore from '@react-native-firebase/firestore';

// Constantes de níveis
export const PROFICIENCY_LEVELS = [
  { level: 1, title: "Iniciante", threshold: 0 },
  { level: 2, title: "Básico", threshold: 51 },
  { level: 3, title: "Pré-Intermediário", threshold: 201 },
  { level: 4, title: "Intermediário", threshold: 501 },
  { level: 5, title: "Avançado", threshold: 1501 },
  { level: 6, title: "Fluente", threshold: 5001 },
  { level: 7, title: "Nativo", threshold: 15000 }
];

// Função para atualizar estatísticas após estudar um flashcard
export const updateFlashcardStats = async (flashcardId, isCorrect) => {
  const flashcardRef = firestore().collection('flashcards').doc(flashcardId);
  
  try {
    // Obter dados atuais do flashcard
    const flashcardDoc = await flashcardRef.get();
    const flashcardData = flashcardDoc.data();
    
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
      lastStudied: firestore.Timestamp.now()
    };
    
    // Atualiza o documento
    await flashcardRef.update({ stats: newStats });
    
    // Se o status de alta retenção mudou, atualiza as estatísticas do deck e usuário
    if (!wasHighRetention && isHighRetention) {
      await updateDeckStats(flashcardData.deckId);
      await updateUserLevel(flashcardData.userId);
    }
    
    return newStats;
  } catch (error) {
    void 0;
    throw error;
  }
};

// Função para atualizar estatísticas do deck
export const updateDeckStats = async (deckId) => {
  const deckRef = firestore().collection('decks').doc(deckId);
  
  try {
    // Busca todos os flashcards do deck
    const flashcardsSnapshot = await firestore()
      .collection('flashcards')
      .where('deckId', '==', deckId)
      .get();
    
    // Calcula estatísticas
    const totalCards = flashcardsSnapshot.size;
    let studiedCards = 0;
    let cardsWithHighRetention = 0;
    let totalRetention = 0;
    
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
    
    const overallRetention = studiedCards > 0 ? Math.round(totalRetention / studiedCards) : 0;
    const completionPercentage = totalCards > 0 ? Math.round((cardsWithHighRetention / totalCards) * 100) : 0;
    
    // Atualiza o deck
    await deckRef.update({
      stats: {
        totalCards,
        studiedCards,
        cardsWithHighRetention,
        overallRetention,
        completionPercentage
      }
    });
    
    return {
      totalCards,
      studiedCards,
      cardsWithHighRetention,
      overallRetention,
      completionPercentage
    };
  } catch (error) {
    void 0;
    throw error;
  }
};

// Função para calcular e atualizar o nível do usuário
export const updateUserLevel = async (userId) => {
  try {
    // Busca todos os flashcards do usuário com alta retenção
    const flashcardsSnapshot = await firestore()
      .collection('flashcards')
      .where('userId', '==', userId)
      .where('stats.highRetentionAchieved', '==', true)
      .get();
    
    const totalCardsWithHighRetention = flashcardsSnapshot.size;
    
    // Determina o nível atual com base nos cards dominados
    const currentLevelData = [...PROFICIENCY_LEVELS]
      .reverse()
      .find(level => totalCardsWithHighRetention >= level.threshold);
    
    // Encontra o próximo nível
    const currentLevelIndex = PROFICIENCY_LEVELS.findIndex(
      level => level.level === currentLevelData.level
    );
    const nextLevel = PROFICIENCY_LEVELS[currentLevelIndex + 1];
    
    // Calcula o progresso
    let progress = 0;
    let cardsNeededForNextLevel = 0;
    
    if (nextLevel) {
      const rangeForLevel = nextLevel.threshold - currentLevelData.threshold;
      const progressInRange = totalCardsWithHighRetention - currentLevelData.threshold;
      progress = Math.min(Math.floor((progressInRange / rangeForLevel) * 100), 99);
      cardsNeededForNextLevel = nextLevel.threshold - totalCardsWithHighRetention;
    } else {
      // Nível máximo
      progress = 100;
      cardsNeededForNextLevel = 0;
    }
    
    // Busca dados atuais do usuário
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    // Verifica se o nível mudou para detectar "level up"
    const oldLevel = userData.gamification?.level || 0;
    const levelUp = currentLevelData.level > oldLevel;
    
    // Atualiza o usuário
    await userRef.update({
      gamification: {
        level: currentLevelData.level,
        title: currentLevelData.title,
        totalCardsWithHighRetention,
        cardsNeededForNextLevel,
        progress,
        // Mantém outras estatísticas caso existam
        streak: userData.gamification?.streak || 0,
        lastStudyDate: userData.gamification?.lastStudyDate || null,
        totalStudySessions: userData.gamification?.totalStudySessions || 0,
        studyTime: userData.gamification?.studyTime || 0
      }
    });
    
    return {
      levelData: {
        level: currentLevelData.level,
        title: currentLevelData.title,
        totalCardsWithHighRetention,
        cardsNeededForNextLevel,
        progress
      },
      levelUp
    };
  } catch (error) {
    void 0;
    throw error;
  }
};

// Atualizar streak diário do usuário
export const updateUserStreak = async (userId) => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const lastStudyDate = userData.gamification?.lastStudyDate?.toDate() || null;
    const lastStudyDay = lastStudyDate 
      ? new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate()).getTime()
      : null;
    
    let newStreak = userData.gamification?.streak || 0;
    
    // Se é a primeira vez estudando
    if (!lastStudyDay) {
      newStreak = 1;
    }
    // Se estudou hoje, não muda o streak
    else if (lastStudyDay === today) {
      // Nada muda
    }
    // Se estudou ontem, aumenta o streak
    else if (today - lastStudyDay === 86400000) { // 24h em ms
      newStreak += 1;
    }
    // Se passou mais de um dia, reseta o streak
    else if (today - lastStudyDay > 86400000) {
      newStreak = 1;
    }
    
    await userRef.update({
      'gamification.streak': newStreak,
      'gamification.lastStudyDate': firestore.Timestamp.now(),
      'gamification.totalStudySessions': (userData.gamification?.totalStudySessions || 0) + 1
    });
    
    return newStreak;
  } catch (error) {
    void 0;
    throw error;
  }
};