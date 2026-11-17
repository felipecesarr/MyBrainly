import React from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { Ionicons, MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from "./styles";

export default function Change(){
  const navigation = useNavigation();

  return(
    <View style={styles.container}>
        <View style={styles.viewHeader}>
        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#414141" />
        </TouchableOpacity>
        <Text style={styles.title}>
          Minha assinatura
        </Text>
        <TouchableOpacity style={[styles.buttonBack, {backgroundColor:'transparent'}]} >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>
    </View>

    <View style={{alignItems: 'center', width: '100%', flex: 1}}>
      <Text style={[styles.textPlan, {paddingTop: 100, fontSize: 20, marginBottom: 20,}]} >Planos disponíveis</Text>

      <View style={styles.viewPlan}>
        <View style={styles.viewOFF}>
          <Text style={styles.textOFF}>40% OFF</Text>
        </View>
        <Text style={styles.textPlan}>Anual</Text>
        <Text style={styles.textPlan}>R$151,12</Text>
        <Text style={[styles.textPlan, {fontSize: 14}]}>*R$12,59 ao mês</Text>
      </View>
    </View>

    <View style={styles.viewButtons}>
      <TouchableOpacity style={[styles.buttonCancel, {padding:12, width: '80%'}]}>
        <Text style={styles.buttonTextCancel}>Trocar assinatura</Text>
      </TouchableOpacity>
    </View>

    </View>
  )
}