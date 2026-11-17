import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";

export default function PickerPayment(){


  const paymentType = (buttonType)=> {
    if( paymentCheck === 'Mensal' && buttonType === 'Mensal'){
      return{
        backgroundColor: 'rgba(203, 72, 223, 0.1)',
        borderColor: 'rgba(203, 72, 223, 1)',
        borderWidth: 1.5,
      }
    } else if( paymentCheck === 'Anual' && buttonType === 'Anual'){
      return{
        backgroundColor: 'rgba(203, 72, 223, 0.1)',
        borderColor: 'rgba(203, 72, 223, 1)',
        borderWidth: 1.5,
      }
    } else{
      return{
        backgroundColor: 'transparent',
        borderColor: '#eee',
        borderWidth: 1.5,
      }
    }
  }

  function activeMensal(){
    setPaymentCheck('Mensal');
    sendPayment('Mensal');
  };
  function activeAnual(){
    setPaymentCheck('Anual');
    sendPayment('Anual');
  };

  return(
    <View style={styles.container}>

      <TouchableOpacity style={[styles.areaSelect, paymentType('Mensal')]} onPress={activeMensal}>
        <View style={{gap: 6}}>
          <Text style={styles.titlePlan}>Mensal</Text>
          <Text style={styles.pricePlan}>R$20,99 / mês</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.areaSelect, paymentType('Anual')]} onPress={activeAnual}>
        <View style={{gap: 6}}>
          <Text style={styles.titlePlan}>Anual</Text>
          <Text style={styles.pricePlan}>R$12,59 / mês (R$151,12 / ano)</Text>
        </View>
      </TouchableOpacity>

    </View>
  )
}