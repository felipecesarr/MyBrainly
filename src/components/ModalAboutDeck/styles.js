import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(33, 33, 33, 0.4)",
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    maxHeight: "70%",
  },
  viewHead: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: 'space-between'
  },
  viewVoltar: {
    backgroundColor: '#F9E2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#CB48DF',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 14,
    marginBottom: 0,
  },
  viewData: {
    backgroundColor: '#fff',
    marginTop: 200,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  viewDoc: {
    marginTop: 32,
    marginBottom: 12,
    gap: 16,
  },
  textDocTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212121'
  },
  textDoc: {
    fontSize: 16,
    fontWeight: '400',
    color: '#747474'
  },
  ViewVocab: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingRight:12,
  },
  viewVocabNumber: {
    backgroundColor: '#F9E2FD',
    padding: 4,
    width: 34,
    height: 34,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textVocabNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CB48DF',
  },
  overlay: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})