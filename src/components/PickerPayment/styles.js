import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 52,
    gap: 14,
  },
  areaSelect: {
    width: '90%',
    height: 80,
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  titlePlan: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  pricePlan: {
    fontSize: 16,
    fontWeight: '500',
    color: '#949494',
  }
})