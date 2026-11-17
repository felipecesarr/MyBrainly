import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content:{
    alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: '#fff'
  },
  image:{
    resizeMode: 'contain',
    width: '70%',
    maxHeight: 400,
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
  textOpen: {
    fontSize: 16,
    fontWeight: '700',
    color: '#cb48df',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
})