import { StyleSheet } from "react-native";
import { withDecay } from "react-native-reanimated";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  headerText: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'center',
    marginBottom: 32,
  },
  textWellcome: {
    fontSize: 30,
    fontWeight: '700',
    color: '#212121'
  },
  textBrain: {
    fontSize: 30,
    fontWeight: '700',
    color: '#F194FF',
    marginLeft: 8,
  },
  areaInput: {
    width: '90%',
    gap: 10,

  },
  titleInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121'
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#212121',
  },
  buttonOpen: {
    width: '90%',
    height: 50,
    backgroundColor: '#212121',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  textOpen: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff'
  },
  buttonRemenber: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttonRegister: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRemenber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cb48df',
    textDecorationLine: 'underline',
  },
  textAccount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121'
  },
  textEntry: {
    fontSize: 16,
    fontWeight: '700',
    color: '#cb48df',
    textDecorationLine: 'underline',
    marginLeft: 6,
  },
})