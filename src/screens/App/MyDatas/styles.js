import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: 'white',
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
    color: '#CB48DF',
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
  viewForm: {
    marginTop: 24,
    width: '90%',

  },
  textTitle: {
    marginVertical: 18,
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  viewInput: {
    backgroundColor: '#eee',
    height: 50,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    padding: 6,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  Input: {
    color: '#212121',
    fontSize: 16,
    textAlignVertical: 'center',
  },
  ViewLogout: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
    gap: 10,
  },
  textLogout: {
    fontSize: 18,
    fontWeight: '400',
    color: '#cb48df'
  },
  dataText: {
    color: '#212121',
    fontWeight: '600',
    fontSize: 16,
  },
  textRedefine: {
    color: '#CB48DF',
    fontWeight: '400',
    fontSize: 16,
    paddingLeft: 10,
    textDecorationLine: 'underline',
  },
  saveButton: {
    width: '60%',
    height: 50,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 62,
    borderRadius: 12,
  },
  textSave: {
    color: '#f0f0f0',
    fontWeight: '600',
    fontSize: 18,
  },
})