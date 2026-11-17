import { StyleSheet, Dimensions, Platform } from "react-native";

const screenWidth = Dimensions.get("window").width;
// Queremos 80% da largura da tela:
const cardWidth = screenWidth * 0.8;
// Queremos que a altura seja 80% dessa largura calculada:
const cardHeight = cardWidth * 0.9;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  card: {
    width: "100%",
    minHeight: 180,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
          ios: {
            shadowColor: '#F194FF',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 1,
            shadowRadius: 8,
          },
          android: {
            elevation: 8,
            shadowColor: '#F194FF',
            borderWidth: 1.4,
            borderColor: 'rgba(241, 148, 255, 0.2)',
            overflow: 'visible',
          },
        }),
  },
  swicthText: {
    alignSelf: 'flex-end',
    color: '#f194ff',
    fontStyle: 'italic',
    fontSize: 18,
  },
  textCard: {
    fontSize: 32,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center'
  },
  viewHeaderRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  touchblePickerDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9E2FD',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 8,
    maxWidth: '60%'
  },
  textTouchblePickerDeck: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CB48DF',
    paddingLeft: 8,
    maxWidth: '80%'
  },
  ViewSkip: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonSkip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSkipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#949494',
  },
  viewProgress: {
    flexDirection: 'colum',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 12,
    padding: 10,
  },
  countCard:{
    flexDirection: 'row',
    marginBottom: 24,
    marginTop:12,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  textCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#989898',
  },
  textTip: {
    fontSize: 14,
    fontWeight: '600',
    color: '#949494',
    maxWidth: '90%',
    textAlign: 'center'
  },
  inputCard: {
    height: 54,
    width: 280,
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 6,
    paddingHorizontal: 14,
    justifyContent: 'center',
    flex: 1,
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '90%',
    marginBottom: 20,
  },
  inputIcon: {
    marginLeft: 8
  }, 
})