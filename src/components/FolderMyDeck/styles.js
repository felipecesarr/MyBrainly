import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24;

export const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 6, // Adicionado espaço horizontal
    overflow: 'hidden',
    shadowColor: '#5C2B8F', // Cor da sombra mais relacionada ao tema
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, // Aumentada a opacidade da sombra
    shadowRadius: 8, // Aumentado o raio da sombra
    elevation: 6, // Aumentado o valor da elevação para Android
    position: 'relative',
    borderWidth: 1, // Adicionada uma borda sutil
    borderColor: '#F0E5F7', // Cor de borda suave que combina com o tema
  },
  containerPressed: {
    transform: [{ scale: 0.96 }], // Efeito mais pronunciado
    shadowOpacity: 0.15,
    borderColor: '#CB48DF80', // Borda colorida quando pressionado
    backgroundColor: '#FCFAFF', // Leve mudança de cor de fundo quando pressionado
  },
  imageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  iconContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CB48DF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCounter: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  cardCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 12,
  },
  deckName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '5%',
    width: '100%'
  },
  creatorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F2E5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  creatorInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CB48DF',
  },
  creatorName: {
    fontSize: 12,
    color: '#777',
  },
  tapIndicator: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: '#F2E5F7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
 // Adicione estes estilos ao seu arquivo de estilos existente

retentionCircleContainer: {
  position: 'absolute',
  top: 10,
  left: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
retentionCircleBackground: {
  width: 36,
  height: 36,
  borderRadius: 100,
  backgroundColor: 'white',
  alignItems: 'center',
  justifyContent: 'center',
},
retentionText: {
  position: 'absolute',
  fontSize: 7,
  fontWeight: 'bold',
  color: '#333333',
  textAlign: 'center',
},
});