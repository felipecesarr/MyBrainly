import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f6f6f6",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  containerExpanded: {
    paddingBottom: 16,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewTexts: {
    flexDirection: "row",
    justifyContent: 'flex-start',
    alignItems: 'center', 
    flex: 1,
  },
  textBR: {
    fontWeight: "600",
    color: "#212121",
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 4,
    color: "#BBBBBB",
  },
  textUS: {
    color: "#666666",
    fontSize: 14,
  },
  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  exampleContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  exampleText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    lineHeight: 20,
    
  }
});