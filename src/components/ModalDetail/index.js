import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { styles } from "./styles";
import { db } from "../../db/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function ModalDetail({ fechar, onDelete, wordData, OnEdit }) {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  const translationInputRef = useRef(null);
  const exampleInputRef = useRef(null);

  useEffect(() => {
    if (wordData) {
      setWord(wordData.word || "");
      setTranslation(wordData.translation || "");
      setExample(wordData.example || "");
    }
  }, [wordData]);

  // Verificar se todos os campos estão preenchidos
  const isFormValid = word.trim() !== "" && translation.trim() !== "" && example.trim() !== "";

  async function handleEdit() {
    if (!isFormValid) {
      Alert.alert("Campos Vazios", "Por favor, preencha todos os campos");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const flashcardRef = doc(db, "flashcards", wordData.id);
      
      // Primeiramente, verificamos se o flashcard já possui estatísticas
      // Isso garante que não vamos perder dados existentes ao editar
      const flashcardDoc = await getDoc(flashcardRef);
      
      // Construir o objeto de atualização
      const updateData = {
        word: word.trim(),
        translation: translation.trim(),
        example: example.trim(),
      };
      
      // Se o documento existir e não tiver stats, adicionamos os valores iniciais
      if (flashcardDoc.exists() && !flashcardDoc.data().stats) {
        updateData.stats = {
          attempts: 0,
          correctAnswers: 0,
          retention: 0,
          highRetentionAchieved: false,
          lastStudied: null
        };
      }
      
      // Atualiza o documento com os novos dados
      await updateDoc(flashcardRef, updateData);
      
      // Se tudo ocorrer bem, notifique sobre a edição
      if (OnEdit) {
        const updatedData = {
          ...wordData,
          word: word.trim(),
          translation: translation.trim(),
          example: example.trim()
        };
        
        // Se adicionamos stats, incluímos no objeto atualizado
        if (updateData.stats) {
          updatedData.stats = updateData.stats;
        }
        
        OnEdit(updatedData);
      }
      
      // Pequena pausa para mostrar o indicador de sucesso
      setTimeout(() => {
        setIsSubmitting(false);
        fechar();
      }, 800);
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Ocorreu um erro ao salvar as alterações");
      setIsSubmitting(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      "Excluir Flashcard",
      "Tem certeza que deseja excluir este flashcard?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            if (onDelete) {
              onDelete(wordData.id);
              fechar();
            }
          }
        }
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={fechar}
      />
      <Animatable.View 
        animation="fadeInUp"
        duration={400}
        style={styles.modalContainer}
      >
        {/* Header com título e botões de ação */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Editar Flashcard</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={handleEdit}
              style={styles.deleteButton}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#f5b1ff" />
              ) : (
                <Ionicons name="checkmark-circle" size={22} color="#f5b1ff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={fechar} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Formulário */}
          <View style={styles.formContainer}>
            {/* Campo Palavra */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Palavra ou frase</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'word' && styles.inputFocused
              ]}>
                <TextInput
                  style={styles.input}
                  value={word}
                  onChangeText={setWord}
                  placeholder="Digite a palavra ou frase"
                  placeholderTextColor="#999"
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
              <Text style={styles.inputLabel}>Tradução</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'translation' && styles.inputFocused
              ]}>
                <TextInput
                  style={styles.input}
                  value={translation}
                  onChangeText={setTranslation}
                  placeholder="Digite a tradução"
                  placeholderTextColor="#999"
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
              <Text style={styles.inputLabel}>Exemplo de uso</Text>
              <View style={[
                styles.inputContainer,
                styles.exampleContainer,
                focusedField === 'example' && styles.inputFocused
              ]}>
                <TextInput
                  style={[styles.input, styles.exampleInput]}
                  value={example}
                  onChangeText={setExample}
                  placeholder="Digite uma frase usando esta palavra"
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={200}
                  ref={exampleInputRef}
                  onFocus={() => setFocusedField('example')}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={handleEdit}
                />
              </View>
              <Text style={styles.charCount}>
                {example.length}/200
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animatable.View>
    </KeyboardAvoidingView>
  );
}