import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Modal, 
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  Platform // Adicionar importação do Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { learningTips as defaultTips } from './data';

const { width, height } = Dimensions.get('window');

export default function TipLearning({ tips = defaultTips, onViewAllPress, sectionTitle = "Dicas para aprender idiomas" }) {
  const [selectedTip, setSelectedTip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animações para o modal
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Animações para o modal
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  // Função para abrir o modal da dica
  const handleOpenTip = (tip) => {
    setSelectedTip(tip);
    setModalVisible(true);
  };

  // Função para fechar o modal da dica
  const handleCloseTip = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTip(null), 300); // Limpar após animação
  };

  // Componente para renderizar cada dica de aprendizado
  const renderLearningTip = ({ item }) => (
    <TouchableOpacity 
      style={[styles.tipCard, { backgroundColor: item.backgroundColor }]}
      onPress={() => handleOpenTip(item)}
      activeOpacity={0.9}
    >
      <View style={styles.tipEmojiContainer}>
        <Text style={styles.tipEmoji}>{item.emoji}</Text>
      </View>
      
      <Image
        source={item.cover}
        style={styles.tipImage}
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.tipGradient}
      >
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDescription}>{item.shortDescription}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Seção de dicas de aprendizado */}
      <View style={styles.sectionHeader}>
        <Text style={{fontSize: 24, transform: [{ rotate: '-80deg' }]}}>📌</Text>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        {/* {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={styles.seeAllLink}>Ver todas</Text>
          </TouchableOpacity>
        )} */}
      </View>
      
      <FlatList
        horizontal
        data={tips}
        renderItem={renderLearningTip}
        keyExtractor={item => `tip-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipsContainer}
      />
      
      {/* Modal de dica de aprendizado */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseTip}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            {selectedTip && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalEmojiContainer}>
                    <Text style={styles.modalEmoji}>{selectedTip.emoji}</Text>
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>{selectedTip.title}</Text>
                    <Text style={styles.modalSubtitle}>{selectedTip.shortDescription}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={handleCloseTip}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                >
                  
                  {/* Conteúdo da dica no estilo de bloco de notas */}
                  <View style={[
                    styles.tipContentContainer, 
                    { backgroundColor: selectedTip.noteColor }
                  ]}>
                    <Text style={styles.tipContentTitle}>{selectedTip.title}</Text>
                    
                    {/* Introdução */}
                    <View style={styles.noteSection}>
                      <Text style={styles.noteIntro}>
                        {selectedTip.content.intro}
                      </Text>
                    </View>
                    
                    {/* Passos */}
                    {selectedTip.content.steps.map((step, stepIndex) => (
                      <View key={`step-${stepIndex}`} style={styles.noteStep}>
                        <View style={[
                          styles.noteStepHeader, 
                          { backgroundColor: selectedTip.accentColor + '20' }
                        ]}>
                          <Text style={styles.noteStepIcon}>{step.icon}</Text>
                          <Text style={styles.noteStepTitle}>{step.title}</Text>
                        </View>
                        
                        {step.items.map((item, itemIndex) => (
                          <View key={`item-${stepIndex}-${itemIndex}`} style={styles.noteItem}>
                            <View style={styles.noteBulletContainer}>
                              <View style={[
                                styles.noteBullet, 
                                { backgroundColor: selectedTip.accentColor }
                              ]} />
                            </View>
                            <Text style={styles.noteItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                    
                    {/* Conclusão */}
                    <View style={[styles.noteConclusion, { borderColor: selectedTip.accentColor + '40' }]}>
                      <FontAwesome5 name="lightbulb" size={16} color={selectedTip.accentColor} style={styles.conclusionIcon} />
                      <Text style={[styles.conclusionText, { color: selectedTip.accentColor }]}>
                        {selectedTip.content.conclusion}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Botão de "Entendi" no final do modal */}
                  <TouchableOpacity
                    style={styles.gotItButton}
                    onPress={handleCloseTip}
                  >
                    <LinearGradient
                      colors={[selectedTip.accentColor, selectedTip.accentColor + 'DD']}
                      style={styles.gotItGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.gotItText}>Entendi</Text>
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Estilos para a seção de cabeçalho
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  seeAllLink: {
    color: '#CB48DF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Estilos para os cards de dicas de aprendizado
  tipsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  tipCard: {
    width: width * 0.75,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  tipGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
  },
  tipEmojiContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tipDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Estilos para o modal de dica
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 1,
    maxHeight: height * 0.85,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalEmojiContainer: {
    backgroundColor: 'rgba(203, 72, 223, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalEmoji: {
    fontSize: 22,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalCloseButton: {
    padding: 6,
    borderRadius: 20,
  },
  modalContent: {
    padding: 16,
  },
  tipImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tipFullImage: {
    width: '100%',
    height: '100%',
  },
  // Estilos para o conteúdo em formato de notas
  tipContentContainer: {
    paddingBottom: 24,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipContentTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  noteSection: {
    marginBottom: 20,
  },
  noteIntro: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontStyle: 'italic',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  noteStep: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  noteStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  noteStepIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  noteStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  noteItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
  },
  noteBulletContainer: {
    paddingTop: 8,
    marginRight: 10,
  },
  noteBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  noteItemText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    flex: 1,
  },
  noteConclusion: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conclusionIcon: {
    marginRight: 10,
  },
  conclusionText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  gotItButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gotItGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  gotItText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});