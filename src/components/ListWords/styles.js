import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f6f6f6",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    width: "90%",
    alignSelf: "center",
    justifyContent: "center",
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
    flex: 1
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  exampleText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    lineHeight: 20,
    width: "84%",
  }
});