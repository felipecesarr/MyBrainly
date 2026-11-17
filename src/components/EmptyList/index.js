import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

export default function EmptyList({ openAdd }) {
  return (
    <Animatable.View 
      style={styles.container} 
      animation="fadeIn"
      duration={800}
    >
      <Animatable.View 
        animation="pulse" 
        iterationCount="infinite" 
        duration={2000}
        style={styles.iconContainer}
      >
        <Ionicons name="book" size={60} color="#CB48DF" />
      </Animatable.View>
      
      <Text style={styles.title}>Sem flashcards ainda</Text>
      
      <Text style={styles.description}>
        Você ainda não adicionou nenhuma palavra. Crie seus próprios flashcards para expandir seu vocabulário!
      </Text>
      
      <View style={styles.tipsContainer}>
        <View style={styles.tipItem}>
          <Ionicons name="bulb-outline" size={22} color="#CB48DF" />
          <Text style={styles.tipText}>Adicione palavras novas que você encontra no dia a dia</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="repeat" size={22} color="#CB48DF" />
          <Text style={styles.tipText}>Revise regularmente para melhorar a memorização</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="star-outline" size={22} color="#CB48DF" />
          <Text style={styles.tipText}>Organize palavras em decks por temas ou níveis</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={openAdd}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle" size={22} color="#FFF" />
        <Text style={styles.addButtonText}>Adicionar meu primeiro flashcard</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
}