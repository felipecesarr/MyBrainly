import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 80,
  },
  viewHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    alignItems: 'center',
    color: '#545454',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonBack: {
    backgroundColor: 'rgba(33, 33, 33, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textH2: {
    alignItems: 'center',
    color: '#545454',
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  viewPick: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 74,
  },
  buttonPicker: {
    backgroundColor: '#F9E2FD',
    height: 34,
    width: 34,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPicker: {
    fontSize: 20,
    fontWeight: '400',
    color: '#CB48DF',
  },
  numberPicker: {
    fontSize: 44,
    fontWeight: '700',
    color: '#414141',
  },
  buttonSave: {
    width: '60%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 54,
    backgroundColor: '#212121',
    borderRadius: 10,
  },
  textSave: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  contentText: {
    backgroundColor: '#eee',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 22,
    paddingVertical: 22,
    borderRadius: 20,
  }
})