import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'baseline',
    alignContent: 'center',
    flexDirection: 'row',
  },
  content: {
    justifyContent: 'center',
    height: 80,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 44,
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    gap: 12,
    elevation: 10,
    borderRadius: 50,
    paddingHorizontal: 8,
    shadowColor: '#212121',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
  butttonTab: {
    justifyContent: 'center',
    alignItems: 'center',

  }
})