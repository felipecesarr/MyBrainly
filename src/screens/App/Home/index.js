import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, Entypo, Fontisto, Feather } from '@expo/vector-icons';
import CountrySelect from "../../../components/CountrySelect";
import MyReports from "../../../components/MyReports/index";
import ModalVocabulary from "../../../components/ModalVocabulary";
import ListWords from "../../../components/ListWords";
import EmptyList from "../../../components/EmptyList";
import ModalDeck from "../../../components/ModalDeck";
import { AuthContext } from "../../../contexts/AuthContext";
import { ProfileContext } from "../../../contexts/ProfilesContext"; // Importando o ProfileContext
import { db } from "../../../db/config";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { SwipeListView } from "react-native-swipe-list-view";
import ModalDetail from "../../../components/ModalDetail";
import LevelIndicator from "../../../components/LevelIndicator";

export default function Home() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext); 
  const [modalAdd, setModalAdd] = useState(false);
  const [modalAddDeck, setModalAddDeck] = useState(false);
  const [palavras, setPalavras] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState(false);
  const [flashcardToEdit, setFlashcardToEdit] = useState(null);

  const generalDeckId = "NuLCnQtWeMsDkgLNy1cY";

  useEffect(() => {
    if (user && selectedProfile) {

      const q = query(
        collection(db, "flashcards"),
        where("deckId", "==", generalDeckId),
        where("userId", "==", user.uid),
        where("profileId", "==", selectedProfile.id), 
        orderBy("createdAt", "desc"),
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const wordsArray = [];
        querySnapshot.forEach((doc) => {
          wordsArray.push({ id: doc.id, ...doc.data() });
        });
        setPalavras(wordsArray);
      });

      return () => unsubscribe();
    }
  }, [user, selectedProfile]);

  function openAdd() {
    setModalAdd(true);
  }

  function closeAdd() {
    setModalAdd(false);
  }

  function abreDrawer() {
    navigation.openDrawer();
  }

  function openCreateDeck() {
    navigation.navigate("LoggedStack", { screen: "CreateDeck", params: { palavras } });
    setModalAddDeck(false);
  }

  function handleDeleteFlashcard(id) {
    Alert.alert(
      "Confirmar Deleção",
      "Você tem certeza que deseja deletar este flashcard?",
      [
        {
          text: "Voltar",
          style: "cancel"
        },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => deleteFlashcard(id)
        }
      ],
      { cancelable: true }
    );
  }

  // Função assíncrona para deletar do Firestore e atualizar o estado local
  async function deleteFlashcard(id) {
    try {
      await deleteDoc(doc(db, "flashcards", id));
      setPalavras((prevWords) => prevWords.filter((word) => word.id !== id));
      Alert.alert("Sucesso", "Flashcard deletado com sucesso.");
    } catch (error) {
      void 0;
      Alert.alert("Erro", "Não foi possível deletar o flashcard.");
    }
  }

  // Render oculto (swipe)
  function renderHiddenItemTransaction({ item }) {
    return (
      <View style={styles.hiddenRow}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleEditFlashcard(item)}
        >
         <Feather name="edit" size={20} color="#F194FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFlashcard(item.id)}
        >
          <Fontisto name="trash" size={20} color='#F194FF' />
        </TouchableOpacity>
      </View>
    );
  }

  function handleEditFlashcard(item) {
    setFlashcardToEdit(item);
    setModalDetails(true);
  }
  
  function closeDetails() {
    setModalDetails(false);
  };

  function handleDelete() {
    onDelete(data.id); // Apenas passa o ID para `Home` gerenciar
    closeDetails();
  }


  const headerComponent = (
    <View style={{alignSelf: 'center'}}>

      <View style={styles.headerView}>
        <CountrySelect abreDrawer={abreDrawer} />

        <LevelIndicator selectedProfile={selectedProfile} />

        <TouchableOpacity style={styles.button} onPress={openAdd}>
          <Text style={styles.textButton}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.ViewStrike}>
        <MyReports/>
      </View>

      <View style={styles.viewH2}>

        <View style={styles.ViewAddDeck}>
          <View style={styles.viewLearned}>
            <Text style={styles.textLearned}>Vocabulário: {palavras.length}</Text>
          </View>
          <TouchableOpacity style={styles.viewAddDeckButton} onPress={() => setModalAddDeck(true)}>
            <MaterialIcons name="dashboard-customize" size={24} color="#CB48DF" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="none" transparent={true} visible={modalAddDeck}>
        <ModalDeck fechar={() => setModalAddDeck(false)} continuar={openCreateDeck} />
      </Modal>

      <Modal animationType="none" transparent={true} visible={modalAdd}>
        <ModalVocabulary 
        fechar={closeAdd}  
        totalWords={palavras.length} 
        saveWord={(text) => setPalavras(text)} />
      </Modal>

      <Modal visible={modalDetails} transparent={true} animationType="none">
        <ModalDetail
          fechar={closeDetails}
          onDelete={handleDelete}
          wordData={flashcardToEdit}
        />
      </Modal>
    </View>
  )

  return (
    <View style={styles.container}>
      <SwipeListView
        data={palavras}
        renderItem={({ item }) => <ListWords data={item} onDelete={handleDeleteFlashcard} onEdit={handleEditFlashcard}/>}
        renderHiddenItem={renderHiddenItemTransaction}
        rightOpenValue={-75}
        leftOpenValue={75}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={<EmptyList openAdd={openAdd}/>}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: '#fff',
          gap: 20,
          paddingBottom: 160,
        }}
      />
    </View>
  );
}
