import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    paddingTop: 0,
    paddingBottom: 0,
  },

  // Themes/Categories
  themesContainer: {
    height: 90,
    marginVertical: 12,
    paddingBottom: 6,
  },
  themesContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 18,
    alignItems: 'center',
    height: '100%',
  },
  themeButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  selectedThemeButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: '#CB48DF',
  },
  themeText: {
    fontSize: 13,
    color: '#989898',
    fontWeight: '500',
  },
  selectedThemeText: {
    color: '#CB48DF',
    fontWeight: '600',
  },

  // Featured Decks
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  featuredDecksList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  featuredDeckItem: {
    width: width * 0.75,
    height: 160,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredCardCount: {
    color: '#FFF',
    marginLeft: 6,
    fontSize: 13,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 16,
    marginHorizontal: 16,
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  counterDeck: {
    minWidth: 24,
    height: 24,
    backgroundColor: '#FCE8FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  textCounter: {
    fontSize: 13,
    color: '#CB48DF',
    fontWeight: '600',
  },

  // Main List
  flatlist: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  deckColumns: {
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  listHeaderContainer: {
    marginBottom: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});