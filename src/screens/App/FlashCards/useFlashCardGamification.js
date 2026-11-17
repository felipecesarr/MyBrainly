import { useState } from 'react';
import { db } from "../../../db/config";
import { doc, getDoc, updateDoc, increment, Timestamp, arrayUnion } from "firebase/firestore";

export function useFlashCardGamification() {
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar e criar estrutura de gamificação para usuário novo
  const ensureGamificationStructure = async (userId) => {
    if (!userId) return;
    
    try {
      setIsProcessing(true);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Verificar se estrutura de gamificação existe
        if (!userData.gamification) {
          // Criar estrutura padrão
          const initialGamification = {
            level: 1,
            title: "Iniciante",
            totalCardsWithHighRetention: 0,
            cardsNeededForNextLevel: 50,
            progress: 0,
            streak: 0,
            lastStudyDate: null,
            totalStudySessions: 0,
            studyTime: 0,
            completedDecks: []
          };
          
          await updateDoc(userRef, {
            gamification: initialGamification
          });
          void 0;
        }
      }
    } catch (error) {
      void 0;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Atualizar estatísticas de um flashcard após resposta
  const updateFlashcardStats = async (flashcardId, isCorrect, userId, profileId) => {
    if (isProcessing || !flashcardId || flashcardId === "default") return;
    
    try {
      setIsProcessing(true);
      
      const flashcardRef = doc(db, "flashcards", flashcardId);
      const flashcardDoc = await getDoc(flashcardRef);
      
      if (flashcardDoc.exists()) {
        // Obter estatísticas atuais ou criar objeto vazio
        const currentStats = flashcardDoc.data().stats || {
          attempts: 0,
          correctAnswers: 0,
          retention: 0,
          highRetentionAchieved: false,
          lastStudied: null
        };
        
        // Calcular novas estatísticas
        const newAttempts = currentStats.attempts + 1;
        const newCorrectAnswers = isCorrect 
          ? currentStats.correctAnswers + 1 
          : currentStats.correctAnswers;
          
        // Calcular nova retenção (evitando divisão por zero)
        const newRetention = newAttempts > 0 
          ? Math.round((newCorrectAnswers / newAttempts) * 100) 
          : 0;
          
        // Verificar se atingiu alta retenção (mínimo 5 tentativas e 80% de acertos)
        const hadHighRetention = currentStats.highRetentionAchieved;
        const hasHighRetention = newRetention >= 80 && newAttempts >= 5;
        
        // Atualizar documento do flashcard
        await updateDoc(flashcardRef, {
          stats: {
            attempts: newAttempts,
            correctAnswers: newCorrectAnswers,
            retention: newRetention,
            highRetentionAchieved: hasHighRetention,
            lastStudied: Timestamp.now()
          }
        });
        
        // Se a condição de alta retenção mudou, atualizar deck e usuário
        if (hasHighRetention !== hadHighRetention) {
          const deckId = flashcardDoc.data().deckId;
          
          // Atualizar estatísticas do deck
          if (deckId) {
            await updateDeckStats(deckId, hasHighRetention ? 1 : -1);
          }
          
          // Atualizar nível do usuário
          if (userId) {
            await updateUserLevel(userId, hasHighRetention ? 1 : -1);
          }
        }
      }
    } catch (error) {
      void 0;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Atualizar estatísticas do deck
  const updateDeckStats = async (deckId, changeInHighRetention = 0) => {
    if (!deckId) return;
    
    try {
      const deckRef = doc(db, "decks", deckId);
      const deckDoc = await getDoc(deckRef);
      
      if (deckDoc.exists()) {
        const deckData = deckDoc.data();
        const stats = deckData.stats || {
          totalCards: 0,
          studiedCards: 0,
          cardsWithHighRetention: 0,
          overallRetention: 0,
          completionPercentage: 0
        };
        
        // Se temos uma alteração no número de cards com alta retenção
        if (changeInHighRetention !== 0) {
          const newCardsWithHighRetention = Math.max(0, stats.cardsWithHighRetention + changeInHighRetention);
          const newCompletionPercentage = stats.totalCards > 0 
            ? Math.round((newCardsWithHighRetention / stats.totalCards) * 100) 
            : 0;
            
          await updateDoc(deckRef, {
            "stats.cardsWithHighRetention": newCardsWithHighRetention,
            "stats.completionPercentage": newCompletionPercentage
          });
        }
      }
    } catch (error) {
      void 0;
    }
  };
  
  // Definir níveis de gamificação
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
  
  // Atualizar nível do usuário
  const updateUserLevel = async (userId, changeInHighRetention = 0) => {
    if (!userId || changeInHighRetention === 0) return;
    
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Obter dados existentes ou criar novo objeto
        const userData = userDoc.data();
        const gamification = userData.gamification || {
          level: 1,
          title: "Iniciante",
          totalCardsWithHighRetention: 0,
          cardsNeededForNextLevel: 50,
          progress: 0,
          streak: 0,
          lastStudyDate: null,
          totalStudySessions: 0,
          studyTime: 0
        };
        
        // Calcular novo total de cards com alta retenção
        const newTotal = Math.max(0, gamification.totalCardsWithHighRetention + changeInHighRetention);
        
        // Determinar novo nível com base no total
        let currentLevel = 1;
        let currentTitle = "Iniciante";
        let nextThreshold = 50;
        
        // Encontrar nível atual baseado no total de cards
        for (let i = LEVELS.length - 1; i >= 0; i--) {
          if (newTotal >= LEVELS[i].threshold) {
            currentLevel = LEVELS[i].level;
            currentTitle = LEVELS[i].title;
            nextThreshold = i < LEVELS.length - 1 ? LEVELS[i+1].threshold : LEVELS[i].threshold;
            break;
          }
        }
        
        // Calcular progresso para o próximo nível
        const currentThreshold = LEVELS[currentLevel - 1].threshold;
        const cardsNeededForNextLevel = nextThreshold - newTotal;
        const progress = currentLevel < LEVELS.length 
          ? Math.round(((newTotal - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
          : 100;
        
        // Atualizar dados de gamificação
        await updateDoc(userRef, {
          gamification: {
            ...gamification,
            level: currentLevel,
            title: currentTitle,
            totalCardsWithHighRetention: newTotal,
            cardsNeededForNextLevel: cardsNeededForNextLevel,
            progress: progress
          }
        });
      }
    } catch (error) {
      void 0;
    }
  };
  
  // Atualizar streak diário de estudo
  const updateDailyStreak = async (userId) => {
    if (!userId) return;
    
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const gamification = userData.gamification || {};
        
        // Obter data da última sessão de estudo
        const lastStudyDate = gamification.lastStudyDate?.toDate() || null;
        let streak = gamification.streak || 0;
        
        // Obter data atual (apenas dia, sem hora)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Se nunca estudou ou estudou hoje, ajustar streak adequadamente
        if (!lastStudyDate) {
          streak = 1; // Primeira vez estudando
        } else {
          const lastDate = new Date(lastStudyDate);
          lastDate.setHours(0, 0, 0, 0);
          
          // Calcular diferença em dias
          const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            // Mesmo dia, não muda nada
          } else if (diffDays === 1) {
            // Dia consecutivo, aumenta streak
            streak += 1;
          } else {
            // Perdeu streak (pulou dias)
            streak = 1;
          }
        }
        
        // Atualizar streak e último dia de estudo
        await updateDoc(userRef, {
          "gamification.streak": streak,
          "gamification.lastStudyDate": Timestamp.now(),
          "gamification.totalStudySessions": increment(1)
        });
      }
    } catch (error) {
      void 0;
    }
  };
  
  // Registrar conclusão de deck
  const logDeckCompletion = async (deckId, userId, timeSpentSeconds, cardsCount) => {
    if (!deckId || !userId) return;
    
    try {
      // Converter tempo para minutos e registrar
      const timeSpentMinutes = Math.max(1, Math.round(timeSpentSeconds / 60));
      await updateStudyTime(userId, timeSpentMinutes);
      
      // Atualizar streak diário
      await updateDailyStreak(userId);
      
      // Registrar o deck como concluído
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        "gamification.completedDecks": arrayUnion({
          deckId: deckId,
          completedAt: Timestamp.now(),
          cardsCount: cardsCount
        })
      });
    } catch (error) {
      void 0;
    }
  };

  // Registrar tempo de estudo
  const updateStudyTime = async (userId, minutes) => {
    if (!userId || minutes <= 0) return;
    
    try {
      const userRef = doc(db, "users", userId);
      
      await updateDoc(userRef, {
        "gamification.studyTime": increment(minutes)
      });
    } catch (error) {
      void 0;
    }
  };
  
  // Retornar funções públicas do hook
  return {
    updateFlashcardStats,
    updateDeckStats,
    updateUserLevel,
    updateDailyStreak,
    updateStudyTime,
    logDeckCompletion,
    ensureGamificationStructure,
    isProcessing
  };
}