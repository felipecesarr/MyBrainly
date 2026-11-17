import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window'); // Pega a largura da tela do dispositivo

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerView: {
    width: '100%', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
     marginTop: 70,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#212121',
    alignSelf: 'center',
  },
  ViewStrike: {
    width: '100%', // 90% da largura da tela
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewH2: {
    width: '100%', 
    marginTop: 32,
    alignItems: 'center',
  },
  h2: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  button: {
    backgroundColor: '#F9E2FD',
    width: 60, 
    height: 30,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  textButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CB48DF',
  },
  textLearned: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CB48DF',
    alignSelf: 'flex-start',
  },
  viewLearned: {
    backgroundColor: '#F9E2FD',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 50,
  },
  viewAddDeckButton: {
    backgroundColor: '#F9E2FD',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ViewAddDeck: {
    width: '100%', // 100% da largura da tela
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  touchblePickerDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#21212110',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 8,
  },
  textTouchblePickerDeck: {
    fontSize: 16,
    fontWeight: '500',
    color: '#949494',
    paddingLeft: 8,
  },
  hiddenRow: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: '#F9E2FD',
    padding: 10,
    borderRadius: 8,
    
  },
});
