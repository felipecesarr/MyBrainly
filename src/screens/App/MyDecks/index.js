import { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from "./styles";
import { AuthContext } from '../../../contexts/AuthContext';
import { ProfileContext } from '../../../contexts/ProfilesContext';
import { db } from '../../../db/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import FooterList from '../../../components/FooterList';
import FolderMyDeck from '../../../components/FolderMyDeck';
import * as Animatable from 'react-native-animatable';
import ModalDeck from '../../../components/ModalDeck';

export default function MyDecks(){
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { selectedProfile } = useContext(ProfileContext);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAddDeck, setModalAddDeck] = useState(false);

  useEffect(() => {
    if(user && selectedProfile){
      setLoading(true);
      const q = query(collection(db,"decks"), 
      where("userId", "==", user.uid),
      where("profileId", "==", selectedProfile.id),
      orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        const decksArray = QuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDecks(decksArray);
        setLoading(false);
      }, (error) => {
        void 0;
        setLoading(false);
      });

      return () => unsubscribe();
    }

  },[user, selectedProfile])

  function openAdd(){
    setModalAddDeck(true)
  }

  function openCreateDeck() {
    navigation.navigate("LoggedStack", { screen: "CreateDeck"});
    setModalAddDeck(false);
  }

  // Renderiza o componente de cabeçalho para a lista
  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.listHeaderTextContainer}>
        <Text style={styles.listHeaderSubtitle}>
          Organize seus flashcards em coleções temáticas
        </Text>
      </View>
    </View>
  );

  // Renderiza o conteúdo vazio para a lista
  const renderEmptyList = () => (
    <Animatable.View
      animation="fadeIn"
      duration={800}
      style={styles.emptyContainer}
    >
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-open-outline" size={70} color="#CB48DF" />
      </View>
      <Text style={styles.emptyTitle}>Sem decks ainda</Text>
      <Text style={styles.emptyDescription}>
        Crie seu primeiro deck para organizar seus flashcards por temas ou categorias.
      </Text>
      <TouchableOpacity
        style={styles.createDeckButton}
        onPress={openAdd}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="folder-plus-outline" size={20} color="#FFF" />
        <Text style={styles.createDeckButtonText}>Criar meu primeiro deck</Text>
      </TouchableOpacity>
      <Modal animationType="none" transparent={true} visible={modalAddDeck}>
        <ModalDeck fechar={() => setModalAddDeck(false)} continuar={openCreateDeck} />
      </Modal>
    </Animatable.View>
  );

  return(
    <View style={styles.container}>
      {/* Header com título e botões */}
      <View style={styles.viewHeader}>
        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.openDrawer()}>
          <Ionicons name="chevron-back" size={24} color="#414141" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Decks</Text>
          <View style={{height: 30, width: 30, borderRadius: 100, backgroundColor: '#CB48DF20', alignItems: 'center', justifyContent: 'center'}} >
            <Text style={styles.numberOfDecks}>
              {decks.length > 0
                ? `${decks.length}`
                : '0'}
            </Text>
          </View>
      </View>
      
      {/* Conteúdo principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CB48DF" />
          <Text style={styles.loadingText}>Carregando seus decks...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={decks}
            renderItem={({item}) => <FolderMyDeck data={item} />}
            numColumns={2}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={<FooterList/>}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatlist}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={item => item.id}
          />
        </View>
      )}
    </View>
  );
}