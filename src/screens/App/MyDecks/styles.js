import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', // Voltando para o background original
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  viewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  buttonBack: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  flatlist: {
    paddingTop: 16,
    paddingBottom: 20, // Reduzido já que não há mais FAB
    paddingHorizontal: 2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  listHeader: {
    marginHorizontal: 4,
    marginBottom: 16,
  },
  listHeaderTextContainer: {
    marginBottom: 8,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#414141',
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FCE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createDeckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CB48DF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#CB48DF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  createDeckButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  numberOfDecks: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CB48DF'
  }
});