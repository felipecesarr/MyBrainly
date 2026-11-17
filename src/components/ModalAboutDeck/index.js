import React, { useState, useEffect, useContext } from "react";
import { 
  View,
   Text, 
   TouchableOpacity, 
   Image, 
   FlatList, 
   Alert, 
   ActivityIndicator, 
   TouchableWithoutFeedback, 
   Modal,
   Share 
  } from "react-native";
import { styles } from "./styles";
import { db } from "../../db/config"; 
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, getDocs, writeBatch, increment, updateDoc } from "firebase/firestore"; 
import ListWordsExplorer from "../ListWordsExplorer";
import { AuthContext } from "../../contexts/AuthContext"; // Importe o contexto de autenticação para obter o usuário atual
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useRevenueCat } from "../../contexts/RevenueCatContext";
import { useNavigation } from "@react-navigation/native";

export default function ModalAboutDeck({ fechar, deckId }) {
  const navigation = useNavigation();
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [isAdding, setIsAdding] = useState(false); // MELHORIA 1: Estado para feedback durante adição
  const { user } = useContext(AuthContext); // Obter o usuário atual

  const { user: rcUser } = useRevenueCat();

  useEffect(() => {
    let unsubscribe; // Para armazenar a função de desinscrição do onSnapshot

    async function fetchDeckData() {

      try {
        if (!deckId) {
          throw new Error("deckId está indefinido!");
        }
   
        const deckRef = doc(db, "decks", deckId);
        const deckSnap = await getDoc(deckRef); 

        if (deckSnap.exists()) {
          const deckInfo = deckSnap.data();

          if (!deckInfo.name || !deckInfo.cover || !deckInfo.description) {
            throw new Error("Dados do deck estão incompletos!");
          }

          setDeckData(deckInfo);
          await fetchFlashcards(deckId);
        } else {
          throw new Error("Deck não encontrado!");
        }
      } catch (error) {
        void 0; 
      } finally {
        setLoading(false);
      }
    }

    async function fetchFlashcards(deckId) {
      try {
        const q = query(
          collection(db, "flashcards"),
          where("deckId", "==", deckId)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const flashcardsArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setFlashcards(flashcardsArray);
        });
      } catch (error) {
        void 0;
      }
    }

    fetchDeckData();

    // Cleanup function para cancelar a subscrição do onSnapshot
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [deckId]);

  

  if (!deckData) {
    return <Text>Erro ao carregar os dados do deck.</Text>;
  }

  // Função para copiar o deck na coleção 'decks'
  async function handleAddDeck() {
    // MELHORIA 1: Feedback durante operação
    if (isAdding) return; // Previne múltiplos cliques durante o processo
    setIsAdding(true);
    
    try {
      // MELHORIA 2: Verificar se o usuário já tem este deck
      const duplicateCheck = query(
        collection(db, "decks"), 
        where("userId", "==", user?.uid || ""),
        where("originalDeckId", "==", deckId)  // Verificar usando o campo que rastreia a origem
      );
      
      const duplicateSnapshot = await getDocs(duplicateCheck);
      
      if (!duplicateSnapshot.empty) {
        Alert.alert("Deck Duplicado", "Você já adicionou este deck à sua coleção.");
        setIsAdding(false);
        return;
      }
      
      // Verifica quantos decks o usuário já criou
      const userDecksQ = query(collection(db, "decks"), where("userId", "==", user.uid));
      const userDecksSnapshot = await getDocs(userDecksQ);
      const deckCount = userDecksSnapshot.size;
      
      // Se não for plus e já tiver 1 deck, alerta e sugere assinar
      if (!rcUser.plus && deckCount >= 1) {
        Alert.alert(
          "Requer Plano Plus",
          "Você atingiu o limite de 1 deck gratuito da comunidade. Assine para adicionar mais!",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Assinar",
              onPress: () => {
                navigation.navigate("Assinatura");
                fechar(); 
              }
            }
          ]
        );
        setIsAdding(false);
        return;
      }
    } catch (err) {
      void 0;
      Alert.alert("Erro", "Não foi possível verificar limite de decks.");
      setIsAdding(false);
      return;
    }
    
    try {
      if (!user || !deckData) {
        Alert.alert("Erro", "Usuário ou dados do deck não encontrados!");
        setIsAdding(false);
        return;
      }
  
      // Atualizar o contador de downloads do deck original
      const deckRefCount = doc(db, "decks", deckId);
      await updateDoc(deckRefCount, {
        downloadCount: increment(1)  // Função increment do Firebase
      });
  
      // Buscar flashcards do deck original para copiar
      const flashcardsQuery = query(
        collection(db, "flashcards"),
        where("deckId", "==", deckId)
      );
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      
      // Inicializa o batch para operações em lote
      const batch = writeBatch(db);
  
      // Cria uma cópia do deck com userId atualizado e isPublic = false
      // MELHORIA 3: Rastreamento da origem
      const deckRef = await addDoc(collection(db, "decks"), {
        cover: deckData.cover,
        createdAt: new Date(),
        description: deckData.description,
        name: deckData.name,
        profileId: deckData.profileId,
        userId: user.uid,  // O usuário que está adicionando o deck
        isPublic: false,   // Definir como privado
        originalDeckId: deckId,  // MELHORIA 3: Armazena a referência ao deck original
        originalCreatorId: deckData.userId || "unknown", // MELHORIA 3: Armazena o criador original
        
        // Campos de gamificação para o novo deck
        // Inicializa com valores zerados, não copiando as estatísticas do deck original
        stats: {
          totalCards: flashcardsSnapshot.size,  // Número correto de flashcards
          studiedCards: 0,
          cardsWithHighRetention: 0,
          overallRetention: 0,
          completionPercentage: 0
        },
        
        // Mantém outros campos que possam estar presentes no deck original
        theme: deckData.theme || "1",
        generatedByAI: deckData.generatedByAI || false,
        downloadCount: 0  // Inicia com zero downloads, já que é uma cópia pessoal
      });
  
      // Itera sobre os flashcards do deck original
      flashcardsSnapshot.forEach((flashcardDoc) => {
        const flashcardData = flashcardDoc.data();
        const newFlashcardRef = doc(collection(db, "flashcards")); // Cria um novo documento para o flashcard
        batch.set(newFlashcardRef, {
          word: flashcardData.word,
          translation: flashcardData.translation,
          example: flashcardData.example,
          deckId: deckRef.id,  // Relacionar o flashcard ao novo deck
          userId: user.uid,    // Atualiza para o novo usuário
          profileId: flashcardData.profileId,
          createdAt: new Date(),
          originalFlashcardId: flashcardDoc.id, // MELHORIA 3: Rastreamento do flashcard original
          
          // Campos de estatísticas para o novo flashcard
          // Inicializa com valores zerados, não copiando as estatísticas do flashcard original
          stats: {
            attempts: 0,
            correctAnswers: 0,
            retention: 0,
            highRetentionAchieved: false,
            lastStudied: null
          }
        });
      });
  
      await batch.commit(); // Executa o batch para criar os flashcards duplicados
  
      Alert.alert("Sucesso", "Deck copiado com sucesso para sua coleção privada!");
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Erro ao copiar o deck.");
    } finally {
      // MELHORIA 1: Finalizar o estado de carregamento independente do resultado
      setIsAdding(false);
    }
  }
  
  function handleClose() {
    fechar();
  }

  async function handleShareDeck() {
    try {
      // Monta o link com o scheme "brainly://".
      // Lembre de concatenar o deckId obtido do firebase
      const deckLink = `https://example.invalid/mybrainly-demo/share?deckId=${deckId}`;

  
      await Share.share({
        message: `Confira este deck no MyBrainly: ${deckLink}`
      });
    } catch (error) {
      void 0;
    }
  }

  const headerComponent = (
    <>
      <View style={styles.viewHead}>
        <TouchableOpacity 
          style={[styles.viewVoltar, isAdding && styles.buttonDisabled]} 
          onPress={handleAddDeck}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#CB48DF" />
          ) : (
            <Text style={styles.backText}>add aos meus decks</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewVoltar} onPress={handleShareDeck}>
          <EvilIcons name="share-apple" size={30} color="#CB48DF" />
        </TouchableOpacity>
      </View>
      <Image source={{ uri: deckData.cover }} style={styles.image} /> 
      <View style={styles.viewDoc}>
        <Text style={styles.textDocTitle}>{deckData.name}</Text> 
        <Text style={styles.textDoc}>{deckData.description}</Text> 

        <View style={styles.ViewVocab}>
          <Text style={styles.textDocTitle}>Vocabulário</Text>
          <View style={styles.viewVocabNumber}>
            <Text style={styles.textVocabNumber}>{flashcards.length}</Text> 
          </View>
        </View>
      </View>
    </>
  );

  return (
    <Modal visible={true} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        {/* Área para fechar o modal ao clicar fora */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>

        {/* Conteúdo do modal */}
        <View style={styles.modalContent}>
          {loading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color="#cb48df" />
            </View>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={flashcards}
              renderItem={({ item }) => (
                <ListWordsExplorer data={item} />
              )}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={headerComponent}
              ListFooterComponent={<View style={{ height: 40 }} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}