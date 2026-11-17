import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  contentRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  container: {
    backgroundColor: '#ffff',
    height: 130,
    width: '42%',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  ViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  ViewFire: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    width: '100%',
  },
  viewIcon: {
    backgroundColor: '#F9E2FD',
    padding: 8,
    borderRadius: 100,
  },
  textHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#747474',
    alignItems: 'center',
  },
  textCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#828282',
    alignItems: 'center',
  },
  viewDays: {
    flexDirection: 'row',
    gap: 18,
    paddingBottom: 8,
    paddingTop: 16,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    width: '100%'
  },
  subtitle: {
    color: '#989898',
    fontWeight: '400',
    fontSize: 12,
  },
  day: {
    color: '#989898',
    fontWeight: '500',
    fontSize: 36,
  }

})