import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50, // Aumenta a altura para mais espaço
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8, // Adiciona espaço entre os itens
    paddingHorizontal: 12, // Adiciona padding para os itens dentro do container
  },
  viewTexts: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: '85%', // Reduz a largura para dar espaço ao ícone
    paddingLeft: 12, // Ajusta o padding para melhor alinhamento
  },
  word: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
  translation: {
    color: '#545454',
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'italic',
    marginLeft: 8, // Adiciona espaço entre a palavra e a tradução
  },
});
