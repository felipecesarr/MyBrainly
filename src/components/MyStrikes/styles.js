import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffff',
    height: 140,
    padding: 10,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowRadius: 4,
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
    justifyContent: 'center',
    gap: 6,
    
  },
  viewIcon: {
    backgroundColor: '#F9E2FD',
    padding: 10,
    borderRadius: 50,
  },
  textHeader: {
    fontSize: 18,
    fontWeight: '500',
    color: '#626262',
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
  },
  countDays: {
    backgroundColor: '#eeee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  day: {
    color: '#545454',
    fontWeight: '600',
    fontSize: 14,
  }

})