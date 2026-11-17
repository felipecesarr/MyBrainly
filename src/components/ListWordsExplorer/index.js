import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { styles } from "./styles";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Habilitar animações de layout no Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function ListWordsExplorer({ data, loading }) {
  // State para controlar expansão
  const [expanded, setExpanded] = useState(false);
  
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
      disabled={loading}
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
        </View>
      )}
    </TouchableOpacity>
  );
}