import React, { useState, useEffect, useContext } from "react";
import { View, Text } from "react-native";
import { db } from "../../db/config/index";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext/index";
import { ProfileContext } from "../../contexts/ProfilesContext/index";
import { getCurrentWeekStartDate } from "../../utils/countDatas/index";
import { styles } from "./styles";
import { Circle } from 'react-native-progress';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function MyReports() {
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext);
  const [progress, setProgress] = useState({
    flashcardsCompleted: 0,
    flashcardsCorrect: 0,
    accuracy: 0,
    weekStartFormatted: ""
  });

  useEffect(() => {
    if (!user || !selectedProfile) return;

    // Obter a data de início da semana atual
    const weekStart = getCurrentWeekStartDate();
    
    // Formatar a data de início da semana para exibição (ex: "10 abr")
    const weekDate = new Date(weekStart);
    const day = weekDate.getDate();
    const month = weekDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    const weekStartFormatted = `${day} ${month}`;
    
    // ID do documento para esta semana
    const docId = `${user.uid}_${selectedProfile.id}_${weekStart}`;
    const docRef = doc(db, "weeklyProgress", docId);

    // Listener para o documento de progresso semanal
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Verificar se os dados são válidos e numéricos
          const flashcardsCompleted = Number(data.flashcardsCompleted) || 0;
          const flashcardsCorrect = Number(data.flashcardsCorrect) || 0;
          
          // Calcular a precisão, garantindo que não haverá divisão por zero
          let accuracy = flashcardsCompleted > 0 
          ? (flashcardsCorrect / flashcardsCompleted) * 100 
          : 0;
          
          // Arredondar para o número inteiro mais próximo para evitar problemas de exibição
          accuracy = Math.round(accuracy, 100);
          const roundedAccuracy = Math.round(accuracy);
          
          void 0;
          
          setProgress({
            flashcardsCompleted,
            flashcardsCorrect,
            accuracy: roundedAccuracy,
            weekStartFormatted
          });
        } else {
          void 0;
          setProgress({
            flashcardsCompleted: 0,
            flashcardsCorrect: 0,
            accuracy: 0,
            weekStartFormatted
          });
          
          // Verificar se há algum registro de semanas anteriores para mostrar inicialmente
          checkPreviousWeeks();
        }
      } catch (error) {
        void 0;
      }
    });

    // Função para buscar dados de semanas anteriores caso não haja dados para a semana atual
    const checkPreviousWeeks = async () => {
      try {
        const weeklyProgressRef = collection(db, "weeklyProgress");
        const userProgressQuery = query(
          weeklyProgressRef, 
          where("userId", "==", user.uid),
          where("profileId", "==", selectedProfile.id)
        );
        
        const querySnapshot = await getDocs(userProgressQuery);
        
        if (!querySnapshot.empty) {
          // Se houver algum registro anterior, pegar o mais recente
          let latestWeekData = null;
          let latestDate = null;
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const weekDate = new Date(data.weekStart);
            
            if (!latestDate || weekDate > latestDate) {
              latestDate = weekDate;
              latestWeekData = data;
            }
          });
          
          if (latestWeekData) {
            void 0;
            // Não atualizamos aqui, pois queremos mostrar 0 para a semana atual
          }
        }
      } catch (error) {
        void 0;
      }
    };

    return () => unsubscribe();
  }, [user, selectedProfile]);

  return (
    <View style={styles.contentRow}>
      <View style={styles.container}>
        <View style={styles.ViewHeader}>
          <View style={styles.ViewFire}>
            <View style={styles.viewIcon}> 
               <MaterialCommunityIcons name="cards" size={16} color="#F194FF" />
            </View>
            <View style={styles.headerTextRowMain}>
              <Text style={styles.textHeader}>Flashcards</Text>
              <Text style={styles.subtitle}>Esta semana...</Text>
            </View>
          </View>
        </View>
        <View style={styles.viewDays}> 
          <Text style={styles.day}>{progress.flashcardsCompleted}</Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.ViewHeader}>
          <View style={styles.ViewFire}>
            <View style={styles.viewIcon}> 
               <FontAwesome6 name="brain" size={14} color="#F194FF" />
            </View>
            <View style={styles.headerTextRowMain}>
              <Text style={styles.textHeader}>Retenção</Text>
              <Text style={styles.subtitle}>Esta semana...</Text>
            </View>
          </View>
        </View>
        <View style={[styles.viewDays, {alignItems: 'center', justifyContent: 'center'}]}>
          <Circle
            size={60}
            progress={(progress.accuracy || 0) / 100} // Garantir valor numérico
            thickness={7}
            showsText={true}
            color="#F194FF"
            unfilledColor="#F194FF30"
            textStyle={{ fontSize: 12, color: '#bcbcbc', fontWeight: '500' }}
            formatText={() => `${progress.accuracy || 0}%`}
            borderWidth={0}
            strokeCap="round"
          />
        </View>
      </View>
    </View>
  );
}