import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 120,
    paddingBottom: 40,
    backgroundColor: 'rgba(33, 33, 33, 0.5)'
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 320,
    borderRadius: 22,
    paddingTop: 20,
    paddingBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 0,
    backgroundColor: '#f4f4f4', // Cor de fundo das opções
    borderRadius: 12, // Bordas arredondadas
    width: 240,
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20, // Deixar a imagem circular
    marginRight: 10, // Espaço entre a bandeira e o texto
  },
  languageText: {
    fontSize: 16,
    color: '#545454', // Cor do texto
  },
});
