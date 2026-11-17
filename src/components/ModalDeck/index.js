import React, { useEffect, useState } from "react";  // Adicionei useState aqui
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Dimensions 
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function ModalDeck({ fechar, continuar }) {
  // Estado para controlar a visibilidade do tooltip
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Características em lista para melhor visualização
  const features = [
    {
      icon: "folder-outline",
      text: "Organize suas palavras por temas",
    },
    {
      icon: "stats-chart-outline",
      text: "Acompanhe seu progresso por deck",
    },
    {
      icon: "rocket-outline", 
      text: "Acelere seu aprendizado com revisões específicas",
    },
  ];

  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="fadeInUp" 
        duration={400} 
        style={styles.viewModalAdd}
      >
        {/* Header com gradiente */}
        <LinearGradient
          colors={['#CB48DF', '#ef238f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Novo Deck</Text>
          <TouchableOpacity style={styles.closeButton} onPress={fechar}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          {/* Imagem animada com ícone de informação */}
          <View style={styles.imageWithInfoContainer}>
            <Animatable.View 
              animation="pulse" 
              iterationCount="infinite" 
              iterationDelay={1000}
              duration={2000}
              style={styles.imageContainer}
            >
              <Image 
                style={styles.imageBrain}
                source={require('../../../assets/MyBrainlyDeck.png')}
                resizeMode="contain"
              />
            </Animatable.View>
            
            {/* Ícone de informação */}
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowTooltip(!showTooltip)}
            >
              <Ionicons name="information-circle" size={24} color="#dbdbdb" />
            </TouchableOpacity>
          </View>

          {/* Tooltip com explicação */}
          {showTooltip && (
            <Animatable.View 
              animation="fadeIn" 
              duration={300}
              style={styles.tooltip}
            >
              <Text style={styles.tooltipTitle}>O que é um Deck?</Text>
              <Text style={styles.tooltipText}>
                Um deck é uma coleção de flashcards organizados por tópico ou tema. 
                Você pode criar decks para vocabulário de viagens, expressões do dia-a-dia, 
                termos técnicos e muito mais!
              </Text>
              <TouchableOpacity 
                style={styles.tooltipCloseButton}
                onPress={() => setShowTooltip(false)}
              >
                <Text style={styles.tooltipCloseText}>Entendi</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* Título e descrição */}
          <Text style={styles.title}>Organize seu aprendizado!</Text>
          <Text style={styles.description}>
            Crie decks temáticos para agrupar palavras relacionadas e otimizar seus estudos.
          </Text>

          {/* Lista de características */}
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <Animatable.View 
                key={index} 
                animation="fadeInRight"
                delay={200 + index * 100}
                duration={500}
                style={styles.featureItem}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={22} color="#ef238f" />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </Animatable.View>
            ))}
          </View>

          {/* Botão principal */}
          <Animatable.View
            animation="fadeIn"
            delay={600}
            duration={800}
          >
            <TouchableOpacity 
              style={styles.createButton}
              onPress={continuar}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="cards-outline" size={22} color="#FFF" />
              <Text style={styles.createButtonText}>Criar meu deck</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Botão secundário */}
          <TouchableOpacity 
            style={styles.laterButton}
            onPress={fechar}
            activeOpacity={0.8}
          >
            <Text style={styles.laterButtonText}>Mais tarde</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModalAdd: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  imageWithInfoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 10,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageBrain: {
    width: 120,
    height: 120,
  },
  infoButton: {
    position: 'absolute',
    top: 0,
    right: -35,
    padding: 5,
    zIndex: 10,
  },
  tooltip: {
    backgroundColor: '#ef238f10',
    borderWidth: 1,
    borderColor: '#ef238f',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#ef238f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  tooltipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  tooltipCloseButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tooltipCloseText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef238f',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 6,
  },
  featuresList: {
    marginTop: 24,
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 300,
    backgroundColor: '#CB48DF',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#ef238f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 12,
    marginTop: 12,
  },
  laterButtonText: {
    color: '#666',
    fontSize: 14,
  },
});