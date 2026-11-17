import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'space-evenly',
    paddingTop: Platform.OS === 'ios' ? 80 : 60, // Different paddingTop for iOS and Android
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  buttonBack: {
    backgroundColor: 'rgba(33, 33, 33, 0.0)',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textHeader: {
    color: '#212121',
    fontSize: 14,
    fontWeight: '500'
  },
  title: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  ViewSeleted: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 34,
  },
  textSelected: {
    color: '#CB48DF',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    marginBottom: 400,
    position: 'absolute',
    backgroundColor: 'yellow',
    alignSelf: 'baseline'
  },
  viewInput: {
    width: '90%',
    marginTop: 24,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#eee',
    width: '100%',
    height: 50,
    padding: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    textAlignVertical: 'center',
  },
  inputDescription: {
    backgroundColor: '#eee',
    width: '100%',
    height: 120,
    padding: 18,
    borderRadius: 12, 
  },
  buttonCreate: {
    width: '60%',
    height: 50,
    backgroundColor: '#212121',
    margin: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  textCreate: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  ViewSwitch: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    width: '90%', 
    marginTop: 22
  },
  titleInputSwitch: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  ViewObs: {
    justifyContent: 'space-between',
    width: '90%', 
    marginTop: 12
  },
  titleIObs: {
    fontSize: 14,
    fontWeight: '400',
    color: '#747474',
    width: '90%'
  },
  selectAllButton: {
    backgroundColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  selectAllText: {
    color: "#CB48DF",
    fontSize: 16,
    fontWeight: "500",
  },
  generateIaButton: {
    backgroundColor: "#212121",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generateIaButtonOne: {
    backgroundColor: "#F9E2FD",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generateIaTextOne: {
    color: "#CB48DF",
    fontSize: 16,
    fontWeight: "400",
  },
  generateIaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
  },
  limitText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  deckCountContainer: {
    backgroundColor: "#F9E2FD",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Estilo padrão para o texto de contagem
  deckCountText: {
    color: 'gray',
    fontSize: 16,
    alignSelf: 'center',
    color: '#CB48DF', // Rosa
    fontWeight: '500',
  },
  // Estilo existente para a mensagem de limite atingido
  limitText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  ViewThemesRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  themeButton: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedThemeButton: {
    backgroundColor: '#f194ff30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.8,
    borderColor: '#CB48DF',
  },
  themeText: {
    color: '#212121',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedThemeText: {
    color: '#CB48DF',
    fontSize: 14,
    fontWeight: '500',
  }
  
})