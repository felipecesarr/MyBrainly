import { startOfWeek, format } from 'date-fns';
import { doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "../../db/config/index";

/**
 * Obtém a data de início da semana atual (segunda-feira).
 * @returns {string} Data formatada como 'yyyy-MM-dd'.
 */
export function getCurrentWeekStartDate() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 para segunda-feira
  return format(weekStart, 'yyyy-MM-dd');
}

/**
 * Incrementa o contador de flashcards completados.
 * @param {string} userId 
 * @param {string} profileId 
 */
export async function incrementFlashcardsCompleted(userId, profileId) {
  const weekStartDate = getCurrentWeekStartDate();
  const docId = `${userId}_${profileId}_${weekStartDate}`;
  const docRef = doc(db, "weeklyProgress", docId);

  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, {
      flashcardsCompleted: increment(1)
    });
  } else {
    await setDoc(docRef, {
      userId,
      profileId,
      weekStartDate,
      flashcardsCompleted: 1,
      flashcardsCorrect: 0
    });
  }
}

/**
 * Incrementa o contador de flashcards corretos.
 * @param {string} userId 
 * @param {string} profileId 
 */
export async function incrementFlashcardsCorrect(userId, profileId) {
  const weekStartDate = getCurrentWeekStartDate();
  const docId = `${userId}_${profileId}_${weekStartDate}`;
  const docRef = doc(db, "weeklyProgress", docId);

  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, {
      flashcardsCorrect: increment(1)
    });
  } else {
    await setDoc(docRef, {
      userId,
      profileId,
      weekStartDate,
      flashcardsCompleted: 0,
      flashcardsCorrect: 1
    });
  }
}
