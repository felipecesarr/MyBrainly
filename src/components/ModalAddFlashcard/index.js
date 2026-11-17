import React, { useState, useContext, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import { styles } from "./styles";
import { AuthContext } from "../../contexts/AuthContext";
import { ProfileContext } from "../../contexts/ProfilesContext";
import { useRevenueCat } from "../../contexts/RevenueCatContext"; 
import { db } from "../../db/config";
import { doc, setDoc, collection, getDoc, updateDoc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function ModalAddFlashcard({ navigation, fechar, deckId, totalWords }) {
  const { user } = useContext(AuthContext);
  const { user: rcUser } = useRevenueCat(); 
  const { selectedProfile } = useContext(ProfileContext);

  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [placeholders, setPlaceholders] = useState({
    word: 'Ex: "Coffee"',
    translation: 'Ex: "Café"',
    example: 'Ex: "I love drinking coffee every morning!"'
  });

  const translationInputRef = useRef(null);
  const exampleInputRef = useRef(null);

  // Verificar se todos os campos estão preenchidos
  const isFormValid = word.trim() !== "" && translation.trim() !== "" && example.trim() !== "";

  // Configurar os placeholders baseados no idioma do perfil
  useEffect(() => {
    if (!selectedProfile) return;
    
    const language = selectedProfile.language || selectedProfile.targetLanguage || 'en'; // fallback para inglês
    updatePlaceholders(language);
  }, [selectedProfile]);

  // Função para atualizar placeholders com base no idioma selecionado
  const updatePlaceholders = (language) => {
    // Normaliza o código de idioma para minúsculas e remove espaços
    const normalizedLang = language.toLowerCase().replace(/\s+/g, '');
    
    // Mapeamento para códigos padrão de idioma
    const languageMap = {
      'inglês': 'en',
      'ingles': 'en',
      'english': 'en',
      'inglês-uk': 'en-gb',
      'ingles-uk': 'en-gb',
      'englishuk': 'en-gb',
      'english-uk': 'en-gb',
      'espanhol': 'es',
      'español': 'es',
      'spanish': 'es',
      'italiano': 'it',
      'italian': 'it',
      'francês': 'fr',
      'frances': 'fr',
      'french': 'fr',
      'alemão': 'de',
      'alemao': 'de',
      'german': 'de',
      'norueguês': 'no',
      'noruegues': 'no',
      'norwegian': 'no',
      'polonês': 'pl',
      'polones': 'pl',
      'polish': 'pl',
      'holandês': 'nl',
      'holandes': 'nl',
      'dutch': 'nl',
      'sueco': 'sv',
      'swedish': 'sv',
      'finlandês': 'fi',
      'finlandes': 'fi',
      'finnish': 'fi',
      'russo': 'ru',
      'russian': 'ru',
      'hindi': 'hi',
      'japonês': 'ja',
      'japones': 'ja',
      'japanese': 'ja',
      'coreano': 'ko',
      'korean': 'ko',
      'chinês': 'zh',
      'chines': 'zh',
      'chinese': 'zh',
      'português': 'pt',
      'portugues': 'pt',
      'portuguese': 'pt'
    };
    
    // Obtém o código de idioma padronizado ou mantém o original se não encontrado
    const langCode = languageMap[normalizedLang] || language.toLowerCase().substring(0, 2);

    const placeholdersByLanguage = {
      // Inglês
      'en': {
        word: 'Ex: "Coffee"',
        translation: 'Ex: "Café"',
        example: 'Ex: "I love drinking coffee every morning!"'
      },
      // Inglês UK
      'en-gb': {
        word: 'Ex: "Flat"',
        translation: 'Ex: "Apartamento"',
        example: 'Ex: "I live in a flat in central London."'
      },
      // Espanhol
      'es': {
        word: 'Ej: "Playa"',
        translation: 'Ej: "Praia"',
        example: 'Ej: "Me encanta ir a la playa en verano."'
      },
      // Italiano
      'it': {
        word: 'Es: "Gelato"',
        translation: 'Es: "Sorvete"',
        example: 'Es: "Mi piace mangiare il gelato quando fa caldo."'
      },
      // Francês
      'fr': {
        word: 'Ex: "Bonjour"',
        translation: 'Ex: "Bom dia"',
        example: 'Ex: "Je dis bonjour à mes voisins tous les matins."'
      },
      // Alemão
      'de': {
        word: 'Bsp: "Brot"',
        translation: 'Bsp: "Pão"',
        example: 'Bsp: "Ich esse gerne frisches Brot zum Frühstück."'
      },
      // Norueguês
      'no': {
        word: 'Eks: "Fjord"',
        translation: 'Eks: "Fiorde"',
        example: 'Eks: "Norge har mange vakre fjorder."'
      },
      // Polonês
      'pl': {
        word: 'Np: "Dziękuję"',
        translation: 'Np: "Obrigado"',
        example: 'Np: "Dziękuję za pomoc przy projekcie."'
      },
      // Holandês
      'nl': {
        word: 'Bijv: "Fiets"',
        translation: 'Bijv: "Bicicleta"',
        example: 'Bijv: "Ik ga elke dag met de fiets naar mijn werk."'
      },
      // Sueco
      'sv': {
        word: 'Ex: "Fika"',
        translation: 'Ex: "Pausa para café"',
        example: 'Ex: "Vi tar en fika klockan tre."'
      },
      // Finlandês
      'fi': {
        word: 'Esim: "Sauna"',
        translation: 'Esim: "Sauna"',
        example: 'Esim: "Suomalaiset käyvät saunassa usein."'
      },
      // Russo
      'ru': {
        word: 'Пример: "Спасибо"',
        translation: 'Пример: "Obrigado"',
        example: 'Пример: "Я говорю спасибо за вашу помощь."'
      },
      // Hindi
      'hi': {
        word: 'उदा: "नमस्ते"',
        translation: 'उदा: "Olá"',
        example: 'उदा: "भारत में लोग एक दूसरे को नमस्ते कहकर अभिवादन करते हैं।"'
      },
      // Japonês
      'ja': {
        word: '例: "寿司"',
        translation: '例: "Sushi"',
        example: '例: "私は週末に寿司を食べるのが好きです。"'
      },
      // Coreano
      'ko': {
        word: '예: "감사합니다"',
        translation: '예: "Obrigado"',
        example: '예: "도움을 주셔서 감사합니다."'
      },
      // Chinês
      'zh': {
        word: '例: "朋友"',
        translation: '例: "Amigo"',
        example: '例: "他是我最好的朋友。"'
      },
      // Português
      'pt': {
        word: 'Ex: "Saudade"',
        translation: 'Ex: "Longing/Missing"',
        example: 'Ex: "A saudade que sinto dos meus amigos é enorme."'
      }
    };

    // Usa placeholders específicos do idioma ou fallback para inglês se não existir
    setPlaceholders(placeholdersByLanguage[langCode] || placeholdersByLanguage['en']);
  };

  // Determina os labels com base no idioma do perfil
  const getFieldLabels = () => {
    // Normaliza o código de idioma
    const language = selectedProfile?.language?.toLowerCase() || 
                     selectedProfile?.targetLanguage?.toLowerCase() || 
                     'pt';
    
    // Estrutura para armazenar os labels em diferentes idiomas
    const labels = {
      // Inglês
      'en': {
        wordLabel: "Word or phrase",
        translationLabel: "Translation",
        exampleLabel: "Example of use"
      },
      'english': {
        wordLabel: "Word or phrase",
        translationLabel: "Translation",
        exampleLabel: "Example of use"
      },
      // Espanhol
      'es': {
        wordLabel: "Palabra o frase",
        translationLabel: "Traducción",
        exampleLabel: "Ejemplo de uso"
      },
      'español': {
        wordLabel: "Palabra o frase",
        translationLabel: "Traducción",
        exampleLabel: "Ejemplo de uso"
      },
      'espanhol': {
        wordLabel: "Palabra o frase",
        translationLabel: "Traducción",
        exampleLabel: "Ejemplo de uso"
      },
      // Outros idiomas definidos como no componente ModalVocabulary...
      // Português - default
      'pt': {
        wordLabel: "Palavra ou frase",
        translationLabel: "Tradução",
        exampleLabel: "Exemplo de uso"
      },
      'português': {
        wordLabel: "Palavra ou frase",
        translationLabel: "Tradução",
        exampleLabel: "Exemplo de uso"
      },
      'portugues': {
        wordLabel: "Palavra ou frase",
        translationLabel: "Tradução",
        exampleLabel: "Exemplo de uso"
      }
    };
    
    // Procura os labels no idioma atual ou usa português como padrão
    return labels[language] || labels['pt'];
  };
  
  const { wordLabel, translationLabel, exampleLabel } = getFieldLabels();

  // Função para obter o nome localizado do idioma
  const getLanguageDisplayName = () => {
    if (!selectedProfile) return "Idioma não definido";
    
    // Tenta usar o nome do idioma armazenado no perfil
    if (selectedProfile.languageName) {
      return selectedProfile.languageName;
    }
    
    // Mapeamento de códigos/nomes de idioma para nomes de exibição em português
    const languageNames = {
      'en': 'Inglês',
      'english': 'Inglês',
      'en-gb': 'Inglês (Reino Unido)',
      'english-uk': 'Inglês (Reino Unido)',
      'es': 'Espanhol',
      'español': 'Espanhol',
      'espanhol': 'Espanhol',
      'it': 'Italiano',
      'italiano': 'Italiano',
      'fr': 'Francês',
      'francês': 'Francês',
      'frances': 'Francês',
      'de': 'Alemão',
      'alemão': 'Alemão',
      'alemao': 'Alemão',
      // ... outros idiomas como no componente ModalVocabulary
    };
    
    const languageKey = selectedProfile.language?.toLowerCase() || 
                         selectedProfile.targetLanguage?.toLowerCase();
    
    return languageNames[languageKey] || languageKey || "Idioma não definido";
  };


// Atualizar a função handleCreateWord
async function handleCreateWord() {
  if (isSubmitting) return;

  // 1. Verifica se usuário tem assinatura
  if (!rcUser.plus && totalWords >= 10) {
    Alert.alert(
      "Requer Plano Plus",
      "Você atingiu o limite de 10 flashcards gratuitos. Assine para continuar!",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Assinar Agora", 
          onPress: () => {
            fechar();
            navigation.navigate("Assinatura"); 
          }
        }
      ]
    );
    return; 
  }

  if (!selectedProfile || !selectedProfile.id) {
    Alert.alert("Erro", "Perfil não disponível. Tente novamente.");
    return;
  }

  if (!isFormValid) {
    Alert.alert("Campos Vazios", "Por favor, preencha todos os campos");
    return;
  }

  setIsSubmitting(true);

  try {
    const flashcardRef = doc(collection(db, 'flashcards'));
    await setDoc(flashcardRef, {
      deckId: deckId, // Usando o deckId recebido via props
      word: word.trim(),
      translation: translation.trim(),
      example: example.trim(),
      userId: user.uid,
      profileId: selectedProfile.id,
      createdAt: new Date(),
      
      // Novos campos de estatísticas para gamificação
      stats: {
        attempts: 0,
        correctAnswers: 0,
        retention: 0,
        highRetentionAchieved: false,
        lastStudied: null
      }
    });

    // Após criar o flashcard, atualize estatísticas do deck
    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);
      
      if (deckDoc.exists()) {
        const deckData = deckDoc.data();
        
        // Se stats não existir no deck, inicialize
        const stats = deckData.stats || {
          totalCards: 0,
          studiedCards: 0,
          cardsWithHighRetention: 0,
          overallRetention: 0,
          completionPercentage: 0
        };
        
        // Incrementa o total de cards
        stats.totalCards += 1;
        
        // Atualiza as estatísticas do deck
        await updateDoc(deckRef, { stats });
      }
    } catch (error) {
      // Apenas log, não interrompe o fluxo principal
      void 0;
    }

    // Animação de sucesso antes de fechar
    setTimeout(() => {
      setWord("");
      setTranslation("");
      setExample("");
      setIsSubmitting(false);
      fechar();
    }, 800);

  } catch (error) {
    void 0;
    Alert.alert("Erro", "Ocorreu um erro ao adicionar a flashcard. Tente novamente.");
    setIsSubmitting(false);
  }
}

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={fechar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalWrapper}>
            <Animatable.View 
              animation="fadeInUp" 
              duration={400}
              style={styles.viewModalAdd}
            >
              {/* Header com título e botão de fechar */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adicionar Flashcard</Text>
                <TouchableOpacity 
                  onPress={fechar} 
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Indicador de idioma selecionado com bandeira */}
              {/* {selectedProfile && (
                <View style={styles.languageIndicator}>
                  {selectedProfile.flagUrl ? (
                    <Image 
                      source={{ uri: selectedProfile.flagUrl }} 
                      style={styles.flagImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="language-outline" size={16} color="#CB48DF" />
                  )}
                  <Text style={styles.languageText}>
                    {getLanguageDisplayName()}
                  </Text>
                </View>
              )} */}

              {/* Contador de flashcards para usuários gratuitos */}
              {!rcUser.plus && (
                <View style={styles.limitIndicator}>
                  <Text style={styles.limitText}>
                    {totalWords}/10 flashcards utilizados
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min(totalWords * 10, 100)}%` },
                        totalWords >= 8 ? { backgroundColor: '#f5b1ff' } : {}
                      ]} 
                    />
                  </View>
                </View>
              )}

              {/* Formulário */}
              <View style={styles.formContainer}>
                {/* Campo Palavra */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{wordLabel}</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'word' && styles.inputFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder={placeholders.word}
                      placeholderTextColor="#999"
                      value={word}
                      onChangeText={(text) => setWord(text)}
                      returnKeyType="next"
                      maxLength={50}
                      onFocus={() => setFocusedField('word')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => {
                        translationInputRef.current?.focus();
                      }}
                      blurOnSubmit={false}
                    />
                    {word.length > 0 && (
                      <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => setWord("")}
                      >
                        <Ionicons name="close-circle" size={18} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.charCount}>
                    {word.length}/50
                  </Text>
                </View>

                {/* Campo Tradução */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{translationLabel}</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'translation' && styles.inputFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder={placeholders.translation}
                      placeholderTextColor="#999"
                      value={translation}
                      onChangeText={(text) => setTranslation(text)}
                      returnKeyType="next"
                      maxLength={50}
                      ref={translationInputRef}
                      onFocus={() => setFocusedField('translation')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => {
                        exampleInputRef.current?.focus();
                      }}
                      blurOnSubmit={false}
                    />
                    {translation.length > 0 && (
                      <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => setTranslation("")}
                      >
                        <Ionicons name="close-circle" size={18} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.charCount}>
                    {translation.length}/50
                  </Text>
                </View>

                {/* Campo Exemplo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{exampleLabel}</Text>
                  <View style={[
                    styles.inputContainer,
                    styles.exampleContainer,
                    focusedField === 'example' && styles.inputFocused
                  ]}>
                    <TextInput
                      style={[styles.input, styles.exampleInput]}
                      placeholder={placeholders.example}
                      placeholderTextColor="#999"
                      value={example}
                      onChangeText={(text) => setExample(text)}
                      returnKeyType="done"
                      multiline={true}
                      numberOfLines={3}
                      maxLength={200}
                      textAlignVertical="top"
                      ref={exampleInputRef}
                      onFocus={() => setFocusedField('example')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={handleCreateWord}
                    />
                  </View>
                  <Text style={styles.charCount}>
                    {example.length}/200
                  </Text>
                </View>
              </View>

              {/* Botão de submissão */}
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  !isFormValid && styles.submitButtonDisabled,
                  isSubmitting && styles.submitButtonLoading
                ]}
                onPress={handleCreateWord}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={18} 
                      color="#FFF" 
                      style={styles.submitIcon} 
                    />
                    <Text style={styles.submitButtonText}>
                      Adicionar Flashcard
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}