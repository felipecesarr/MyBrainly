import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ScrollView, 
  TouchableWithoutFeedback,
  Platform,
  BackHandler,
  Pressable,
  Dimensions
} from 'react-native';
import { useGamification } from '../../contexts/GamificationContext';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons, FontAwesome5, AntDesign, FontAwesome6 } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

const windowHeight = Dimensions.get('window').height;

export default function LevelIndicator({ selectedProfile }) {
  const { userLevel, updateUserLevel } = useGamification();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Emojis para cada nível
  const levelEmojis = {
    1: '🌱', // Iniciante
    2: '🌿', // Aprendiz
    3: '🍀', // Básico
    4: '🌲', // Intermediário
    5: '🚀', // Avançado
    6: '🌟', // Fluente
    7: '🧠', // Proficiente
    8: '🏆', // Nativo
  };

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (tooltipVisible) {
            setTooltipVisible(false);
            return true;
          }
          return false;
        }
      );

      return () => backHandler.remove();
    }
  }, [tooltipVisible]);

  // Modifique esta função para atualizar dados antes de abrir o modal
  const toggleTooltip = async () => {
    if (!tooltipVisible) {
      // Se estamos abrindo o modal, atualiza dados primeiro
      try {
        await updateUserLevel();
        void 0;
      } catch (error) {
        void 0;
      }
    }
    setTooltipVisible(!tooltipVisible);
  };
  // Se não temos dados de nível ou perfil selecionado
  if (!userLevel || !selectedProfile) {
    return (
      <TouchableOpacity style={styles.touchablePickerDeck}>
        <Text style={styles.textTouchablePickerDeck}>
          Selecionar idioma
        </Text>
      </TouchableOpacity>
    );
  }

  const emoji = levelEmojis[userLevel.level] || '🌱';

  // Determinar o próximo nível
  const getNextLevelInfo = () => {
    if (userLevel.level >= 8) return null;
    
    const nextLevel = userLevel.level + 1;
    return {
      level: nextLevel,
      emoji: levelEmojis[nextLevel],
      title: [
        "Aprendiz",
        "Básico", 
        "Intermediário", 
        "Avançado", 
        "Fluente", 
        "Proficiente",
        "Nativo"
      ][nextLevel - 2]
    };
  };

  const nextLevel = getNextLevelInfo();

  return (
    <>
      <TouchableOpacity style={styles.touchablePickerDeck} onPress={toggleTooltip}>
        <View style={styles.levelContainer}>
          <Text style={styles.emojiText}>{emoji}</Text>
          <Text style={styles.textTouchablePickerDeck}>
            {userLevel.title}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={tooltipVisible}
        onRequestClose={toggleTooltip}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          {/* Overlay para detecção de toque fora do modal */}
          <TouchableWithoutFeedback onPress={toggleTooltip}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          
          <Animatable.View 
            animation="fadeInUp" 
            duration={300}
            style={styles.tooltipContainer}
            useNativeDriver={true}
          >
            {/* Cabeçalho fixo */}
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>{emoji} {userLevel.title}</Text>
              <Pressable onPress={toggleTooltip} style={styles.closeButton}>
                <AntDesign name="close" size={22} color="#333" />
              </Pressable>
            </View>
            
            {/* Conteúdo rolável */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              scrollEventThrottle={16}  // Melhora a resposta do scroll
              overScrollMode="always"   // Melhor feedback visual no Android
              nestedScrollEnabled={true} 
            >

              {/* Cartão de progresso atual */}
              <Animatable.View 
                animation="fadeIn" 
                delay={100} 
                style={styles.progressCard}
              >
                <Text style={styles.progressTitle}>Seu progresso atual em {selectedProfile?.language}</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <FontAwesome6 name="brain" size={24} color="#F194FF" style={styles.statIcon} />
                    <View>
                      <Text style={styles.statValue}>{userLevel.totalCardsWithHighRetention}</Text>
                      <Text style={styles.statLabel}>Cards dominados</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statItem}>
                    <FontAwesome5 name="fire" size={24} color="#FF5722" style={styles.statIcon} />
                    <View>
                      <Text style={styles.statValue}>{userLevel.streak || 0}</Text>
                      <Text style={styles.statLabel}>Dias seguidos</Text>
                    </View>
                  </View>
                </View>

                {nextLevel && (
                  <View style={styles.nextLevelContainer}>
                    <View style={styles.levelMilestoneContainer}>
                      <View style={styles.currentLevelMarker}>
                        <Text style={styles.markerEmoji}>{emoji}</Text>
                      </View>
                      <View style={styles.nextLevelMarker}>
                        <Text style={styles.markerEmoji}>{nextLevel.emoji}</Text>
                      </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <Progress.Bar
                        progress={userLevel.progress ? userLevel.progress/100 : 0}
                        width={null}
                        height={10}
                        color="#CB48DF"
                        unfilledColor="#e0e0e0"
                        borderWidth={0}
                        borderRadius={5}
                        animated={true}
                        style={{flex: 1}}
                      />
                      <Text style={styles.progressPercentText}>
                        {typeof userLevel.progress === 'number' ? userLevel.progress : 0}%
                      </Text>
                    </View>
                    
                    <Text style={styles.nextLevelText}>
                      Faltam <Text style={styles.highlightText}>{userLevel.cardsNeededForNextLevel}</Text> cards com alta retenção para você atingir o nível <Text style={styles.highlightText}>{nextLevel.title}</Text>
                    </Text>
                  </View>
                )}
                
                {!nextLevel && (
                  <View style={styles.maxLevelContainer}>
                    <Animatable.Text 
                      animation="pulse" 
                      iterationCount="infinite"
                      style={styles.maxLevelText}
                    >
                      🏆 Parabéns! Você atingiu o nível máximo!
                    </Animatable.Text>
                  </View>
                )}
              </Animatable.View>

              {/* Explicação da retenção */}
              <Animatable.View animation="fadeIn" delay={200} style={styles.infoSection}>
                <Text style={styles.sectionTitle}>
                  Como funciona a retenção?
                </Text>
                
                <View style={styles.retentionExplainer}>
                  <View style={styles.retentionStep}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                    <Text style={styles.stepText}>Ao estudar um flashcard, você responde se acertou ou errou</Text>
                  </View>
                  
                  <View style={styles.retentionStep}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                    <Text style={styles.stepText}>Um flashcard precisa ter <Text style={styles.highlightText}>pelo menos 5 tentativas</Text></Text>
                  </View>
                  
                  <View style={styles.retentionStep}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                    <Text style={styles.stepText}>Quando sua <Text style={styles.highlightText}>taxa de acerto atingir 80%</Text>, o card é considerado com alta retenção</Text>
                  </View>
                  
                  <View style={styles.retentionStep}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
                    <Text style={styles.stepText}>Os cards com alta retenção determinam seu nível de proficiência</Text>
                  </View>
                </View>
              </Animatable.View>

              {/* Tabela de níveis */}
              <Animatable.View animation="fadeIn" delay={300} style={styles.levelTableSection}>
                <Text style={styles.sectionTitle}>
                  Níveis de proficiência
                </Text>
                
                <View style={styles.levelTable}>
                  {[
                    { emoji: '🌱', level: 1, title: "Iniciante", range: "0-99" },
                    { emoji: '🌿', level: 2, title: "Aprendiz", range: "100-499" },
                    { emoji: '🍀', level: 3, title: "Básico", range: "500-999" },
                    { emoji: '🌲', level: 4, title: "Intermediário", range: "1.000-2.999" },
                    { emoji: '🚀', level: 5, title: "Avançado", range: "3.000-4.999" },
                    { emoji: '🌟', level: 6, title: "Fluente", range: "5.000-7.499" },
                    { emoji: '🧠', level: 7, title: "Proficiente", range: "7.500-14.999" },
                    { emoji: '🏆', level: 8, title: "Nativo", range: "15.000+" }
                  ].map((item) => (
                    <View 
                      key={item.level} 
                      style={[
                        styles.levelRow,
                        userLevel.level === item.level ? styles.currentLevelRow : null
                      ]}
                    >
                      <Text style={styles.levelEmoji}>{item.emoji}</Text>
                      <Text style={[
                        styles.levelName,
                        userLevel.level === item.level ? styles.currentLevelText : null
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={[
                        styles.levelRange,
                        userLevel.level === item.level ? styles.currentLevelText : null
                      ]}>
                        {item.range} cards
                      </Text>
                    </View>
                  ))}
                </View>
              </Animatable.View>
              
              {/* Dica final */}
              <Animatable.View animation="fadeIn" delay={400} style={styles.tipSection}>
                <Text style={styles.tipText}>
                  <MaterialIcons name="lightbulb" size={18} color="#FF9800" /> Dica: Revisite regularmente os cards que já estudou para mantê-los com alta retenção.
                </Text>
              </Animatable.View>
              
              {/* Espaço adicional no final para melhorar a rolagem */}
              <View style={{height: 30}} />
            </ScrollView>
          </Animatable.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  touchablePickerDeck: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#cb48df',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 6,
    elevation: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 18,
    marginRight: 8,
  },
  textTouchablePickerDeck: {
    color: '#212121',
    fontSize: 14,
    fontWeight: '500',
  },
  // Nova estrutura de modal com melhor gerenciamento de eventos
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    margin: 0,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tooltipContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: Platform.OS === 'android' ? '90%' : '80%', // aumentar para Android
    paddingBottom: Platform.OS === 'android' ? 20 : 0, // espaço extra no Android
    overflow: 'hidden',
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white', // Garantir que o cabeçalho seja opaco
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flexGrow: 0,
    height: Platform.OS === 'android' ? windowHeight * 0.75 : undefined,
  },
  scrollContent: {
    paddingHorizontal: 5,
    paddingBottom: Platform.OS === 'android' ? 60 : 20, // Aumentar para Android
    flexGrow: 1, // Permite que o conteúdo se expanda no Android
  },
  languageContainer: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 10,
  },
  languageText: {
    fontSize: 18,
    color: '#CB48DF',
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#989898',
    marginBottom: 32,
    textAlign: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  nextLevelContainer: {
    marginTop: 5,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#CB48DF',
    borderRadius: 5,
  },
  progressPercentText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#989898',
  },
  levelMilestoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginRight: 40,
  },
  currentLevelMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextLevelMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerEmoji: {
    fontSize: 16,
  },
  nextLevelText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  maxLevelContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 15,
  },
  maxLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CB48DF',
  },
  infoSection: {
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#989898',
    marginBottom: 15,
  },
  retentionExplainer: {
    marginTop: 5,
  },
  retentionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CB48DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#989898',
    lineHeight: 20,
    flexShrink: 1,
  },
  levelTableSection: {
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  levelTable: {
    marginTop: 5,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentLevelRow: {
    backgroundColor: '#f8f0ff',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  currentLevelText: {
    color: '#CB48DF',
    fontWeight: 'bold',
  },
  levelEmoji: {
    fontSize: 16,
    width: 30,
  },
  levelName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  levelRange: {
    fontSize: 14,
    color: '#666',
  },
  tipSection: {
    padding: 15,
    margin: 15,
    marginTop: 5,
    borderRadius: 12,
    backgroundColor: '#fffbf0',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#CB48DF',
  },
});