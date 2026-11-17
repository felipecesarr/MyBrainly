import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { styles } from './styles';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import FolderDeck from "../../../components/FolderDeck";
import FooterList from "../../../components/FooterList";
import { db } from "../../../db/config"; 
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ProfileContext } from "../../../contexts/ProfilesContext";
import { useRoute, useNavigation } from '@react-navigation/native';
import ModalAboutDeck from '../../../components/ModalAboutDeck';
import * as Animatable from 'react-native-animatable';
import TipLearning from '../../../components/TipLearning';


const deckThemes = [
  { key: "0", emoji: "🌎", title: "Todos" },
  { key: "1", emoji: "🎬", title: "Filmes & Séries" },
  { key: "2", emoji: "🍣", title: "Gastronomia" },
  { key: "3", emoji: "🛒", title: "Supermercado" },
  { key: "4", emoji: "🩷", title: "Dates & Relacionamentos" },
  { key: "5", emoji: "🌍", title: "Viagens & Turismo" },
  { key: "6", emoji: "💼", title: "Negócios & Trabalho" },
  { key: "7", emoji: "💻", title: "Tecnologia" },
  { key: "8", emoji: "🏋️", title: "Esportes & Fitness" },
  { key: "9", emoji: "🧥", title: "Moda & Estilo" },
  { key: "10", emoji: "🏥", title: "Saúde & Bem-estar" },
  { key: "11", emoji: "📚", title: "Educação & Estudo" },
  { key: "12", emoji: "🎨", title: "Música & Artes" },
  { key: "13", emoji: "🎮", title: "Jogos & Entretenimento" },
  { key: "14", emoji: "🐶", title: "Animais & Natureza" },
  { key: "15", emoji: "🏙️", title: "Cotidiano & Vida Urbana" },
  { key: "16", emoji: "🛍️", title: "Compras & Lojas" },
  { key: "17", emoji: "🏛️", title: "Cultura & História" },
  { key: "18", emoji: "🌦️", title: "Clima & Estações" },
  { key: "19", emoji: "🚗", title: "Meios de Transporte" },
  { key: "20", emoji: "💰", title: "Finanças & Economia" },
  { key: "21", emoji: "🎉", title: "Eventos & Festas" },
  { key: "22", emoji: "♟️", title: "Jogos de Mesa & Estratégia" },
  { key: "23", emoji: "📸", title: "Fotografia" },
  { key: "24", emoji: "🎶", title: "Música" },
  { key: "25", emoji: "🙏", title: "Fé & Religião" }
];

export default function Explorer() {
  const navigation = useNavigation();
  const { selectedProfile } = useContext(ProfileContext);
  const [explorerDecks, setExplorerDecks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("0");
  const [showSearch, setShowSearch] = useState(false);
  

  const route = useRoute();
  const { deckId } = route.params || {};
  const [modalDeckId, setModalDeckId] = useState(null);

  useEffect(() => {
    if (deckId) {
      setModalDeckId(deckId);
    }
  }, [deckId]);

  useEffect(() => {
    if (!selectedProfile) return;

    const q = query(
      collection(db, "decks"),
      where("isPublic", "==", true), 
      where("profileId", "==", selectedProfile.id),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const decksArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setExplorerDecks(decksArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedProfile]);
  
 
  const filteredDecks = explorerDecks.filter(deck => {
    const searchQueryLower = searchQuery.toLowerCase();
    const matchesTitle = deck.name.toLowerCase().includes(searchQueryLower);
    const matchesCreator = deck.creatorName?.toLowerCase().includes(searchQueryLower);
    const matchesTheme = selectedTheme === "0" || deck.theme === selectedTheme;

    return (matchesTitle || matchesCreator) && matchesTheme;
  });

  // Determinar uma mensagem adequada quando não há resultados
  const getEmptyMessage = () => {
    if (searchQuery) {
      return `Não encontramos decks para "${searchQuery}"`;
    }
    if (selectedTheme !== "0") {
      const themeName = deckThemes.find(theme => theme.key === selectedTheme)?.title || "";
      return `Não há decks na categoria ${themeName}`;
    }
    return "Não há decks disponíveis";
  };

  const renderEmptyList = () => (
    <Animatable.View 
      animation="fadeIn"
      duration={500}
      style={styles.emptyContainer}
    >
      <Ionicons name="search-outline" size={60} color="#DBDBE0" />
      <Text style={styles.emptyTitle}>{getEmptyMessage()}</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || selectedTheme !== "0" ? 
          "Tente usar outros filtros ou termos de pesquisa" : 
          "Os decks compartilhados pela comunidade aparecerão aqui"}
      </Text>
    </Animatable.View>
  );


  // Componente para o header da lista principal
  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Componente TipLearning para gerenciar as dicas de aprendizado */}
      <TipLearning 
        onViewAllPress={() => navigation.navigate('Tips')}
        sectionTitle="Dicas para aprender idiomas"
      />
      
      <View style={styles.divider} />
  
      {/* Cabeçalho dos resultados filtrados */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {selectedTheme === "0" ? 
            "Todos os decks" : 
            `Decks de ${deckThemes.find(theme => theme.key === selectedTheme)?.title || ""}`}
        </Text>
        <View style={styles.counterDeck}>
          <Text style={styles.textCounter}>{filteredDecks.length}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CB48DF" />
        <Text style={styles.loadingText}>Carregando decks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      
      {/* Header com título e botões */}
      <Animatable.View 
        animation="fadeIn" 
        duration={500} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Explorar</Text>
            <Text style={styles.headerSubtitle}>
              Descubra decks da comunidade
            </Text>
          </View>
          
          {/* Botão de pesquisa */}
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons 
              name={showSearch ? "close-outline" : "search-outline"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
        </View>
      </Animatable.View>
      
      {/* Barra de pesquisa expansível */}
      {showSearch && (
        <Animatable.View 
          animation="fadeInDown" 
          duration={300} 
          style={styles.searchView}
        >
          <AntDesign name="search1" size={20} color="#989898" />
          <TextInput 
            placeholder="Buscar por nome ou autor..." 
            placeholderTextColor="#989898"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#989898" />
            </TouchableOpacity>
          )}
        </Animatable.View>
      )}
      
      {/* Categorias/Temas */}
      <ScrollView
        style={styles.themesContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.themesContent}
      >
        {deckThemes.map((theme) => {
          const isSelected = selectedTheme === theme.key;
          
          return (
            <TouchableOpacity
              key={theme.key}
              onPress={() => setSelectedTheme(theme.key)}
              style={[styles.themeButton, isSelected && styles.selectedThemeButton]}
            >
              <Text style={[styles.themeText, isSelected && styles.selectedThemeText]}>
                {theme.emoji} {theme.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista principal de decks */}
      <FlatList
        data={filteredDecks}
        renderItem={({ item }) => <FolderDeck data={item} />}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={<FooterList />}
        contentContainerStyle={styles.flatlist}
        columnWrapperStyle={styles.deckColumns}
      />

      {/* Modal de detalhes do deck */}
      {modalDeckId && (
        <ModalAboutDeck 
          deckId={modalDeckId} 
          fechar={() => setModalDeckId(null)}
        />
      )}
    </View>
  );
}

