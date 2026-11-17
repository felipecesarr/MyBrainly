import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:  'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(33, 33, 33, 0.4)'
  },
  viewModalAdd: {
    width: '100%',
    height: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  viewVoltar: {
    backgroundColor: '#F9E2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  backText: {
    color: '#CB48DF',
    fontSize: 16,
    fontWeight: '400',
  },
  text: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 22,
  },
  imageBrain: {
    height: 220,
    width: 220,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#CB48DF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  textButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f0f0f0',
  },
})