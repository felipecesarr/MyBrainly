import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";

export default function SelectedList({ data, onSelect, isSelected }) {

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSelect}>
        <Ionicons
          name={isSelected ? "checkmark-circle" : "checkmark-circle-outline"}
          size={24}
          color={isSelected ? "#cb48df" : "#cacaca"}
        />
      </TouchableOpacity>
      <View style={styles.viewTexts}>
        <Text style={styles.word}>{data.word}</Text>
        <Text style={styles.word}> -</Text>
        <Text style={styles.translation}>{data.translation}</Text>
      </View>
    </View>
  );
}
