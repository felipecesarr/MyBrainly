import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'white',
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  viewHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonBack: {
    backgroundColor: 'rgba(33, 33, 33, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    alignItems: 'center',
    color: '#212121',
    fontSize: 18,
    fontWeight: '500',
  },
  viewPickPlan: {
    padding: 14,
    marginTop: 22,
    height: 84,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: '#dbdbdb',
    justifyContent: 'space-between',
  },
  textPlan: {
    fontSize: 24,
    fontWeight: '500',
    color: '#545454',
  },
  textTitlePlan: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212121',
    gap: 6,
  },
  textPricePlan: {
    fontSize: 14,
    fontWeight: '500',
    color: '#989898',
  },
  buttonCancel: {
    height: 54,
    width: '90%',
    backgroundColor: '#212121',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextCancel: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
  },
  buttonTextChange: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
  },
  viewOFF: {
    height: 50,
    width: 100,
    backgroundColor: '#F194FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginTop: -40,
    marginRight: 10,
  },
  textOFF: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  viewLink: {
    paddingHorizontal: 20,
    paddingVertical: 10, 
    alignSelf: 'flex-end',
  },
  selectPlans: {
    alignItems: 'center', 
    width: '100%', 
  },
  privacyText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  privacyLink: {
    color: '#CB48DF',
    fontWeight: '500',
  }

})