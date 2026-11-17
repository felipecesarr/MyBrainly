import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: 140,
    backgroundColor: 'rgba(33, 33, 33, 0.2)'
  },
  modalContainer: {
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 22,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f4f4f4', // Cor de fundo das opções
    borderRadius: 12, // Bordas arredondadas
    width: '100%',
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20, // Deixar a imagem circular
    marginRight: 10, // Espaço entre a bandeira e o texto
  },
  languageText: {
    fontSize: 16,
    color: '#545454',
  },
});
