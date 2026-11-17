import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerRow:{
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  buttonBack: {
    height: 42,
    width: 42,
    borderWidth: 1.2,
    borderColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  image:{
    resizeMode: 'contain',
    width: 90,
    maxHeight: 90,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 30,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: '#747474',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  textAlready: {
    fontSize: 16,
    fontWeight: '500',
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
})