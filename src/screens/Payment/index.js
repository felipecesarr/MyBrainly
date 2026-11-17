import React from "react";
import {Text,TouchableOpacity, SafeAreaView } from "react-native";
import { styles } from "./styles";
import PickerPayment from "../../components/PickerPayment";


export default function Payment() {


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Escolha seu plano</Text>
      <PickerPayment />
      <TouchableOpacity style={styles.buttonOpen}>
        <Text style={styles.textOpen}>Abrir conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}