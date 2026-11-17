import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { styles } from "./styles";
import { Circle } from 'react-native-progress';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Habilitar animações de layout no Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function ListWords({ data }) {
  // State para controlar expansão
  const [expanded, setExpanded] = useState(false);
  
  // Corrigido para acessar o caminho correto no Firestore: stats.retention
  const retention = data?.stats?.retention || 0;
  
  // Arredonda para exibição
  const retentionPercentage = Math.round(retention);
  
  // Determina a cor baseada no nível de retenção
  const getColorByRetention = (percentage) => {
    if (percentage < 50) {
      return {
        progress: '#FF9EB5', // Laranja pastel 
        background: '#FF9EB530' // Laranja pastel com transparência
      };
    } else if (percentage < 80) {
      return {
        progress: '#7AB3FF', // Azul pastel
        background: 'rgba(122, 179, 255, 0.30)' // Azul pastel com transparência 
      };
    } else {
      return {
        progress: '#7ADCB9', // Verde água pastel
        background: 'rgba(122, 220, 185, 0.30)' // Verde água pastel com transparência
      };
    }
  };
  
  const colors = getColorByRetention(retentionPercentage);
  
  // Determina a espessura do texto baseada na tentativas
  const getTextStyle = () => {
    // Se retenção for 0 (nunca estudado) ou abaixo de 5 tentativas
    // Também verificamos o caminho correto para tentativas: stats.attempts
    if (retentionPercentage === 0 || (data?.stats?.attempts && data.stats.attempts < 5)) {
      return { fontSize: 8, color: '#000', fontWeight: '500' };
    }
    // Se alta retenção (≥80%)
    else if (retentionPercentage >= 80) {
      return { fontSize: 8, color: '#000', fontWeight: '500' };
    }
    // Retenção média
    else {
      return { fontSize: 8, color: '#000', fontWeight: '500' };
    }
  };
  
  // Função para lidar com o toque
  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, expanded && styles.containerExpanded]} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.mainContent}>
        <View style={styles.viewTexts}>
        <Text 
            numberOfLines={1} 
            ellipsizeMode="tail"
            style={[styles.textBR, { flexShrink: 1 }]}>
            {data.word}
          </Text>
          <Text style={styles.separator}>-</Text>
          <Text 
            numberOfLines={1} 
            ellipsizeMode="tail"
            style={[styles.textUS, { flexShrink: 1 }]}>
            {data.translation}
          </Text>
        </View>

        {expanded ? (
          <MaterialCommunityIcons name="chevron-up" size={24} color="#989898" />
         ) : (
           <MaterialCommunityIcons name="chevron-down" size={24} color="#989898" />
         ) 
        }

      </View>
      
      {/* Exemplo - exibido apenas quando expandido */}
      {expanded && data.example && (
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleText}>{data.example}</Text>
            <View style={styles.progressContainer}>
              <Circle
                size={36}
                progress={retentionPercentage / 100}
                thickness={4.5}
                showsText={true}
                color={colors.progress}
                unfilledColor={colors.background}
                textStyle={getTextStyle()}
                formatText={() => `${retentionPercentage}%`}
                borderWidth={0}
                strokeCap="round"
                direction="clockwise"
              />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}