import React, {useState} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

export default function MyGoals(){
  const navigation = useNavigation();
  const [numberGoal, setNumberGoal] = useState(0);

function plusGoal(){
  setNumberGoal(numberGoal+1)
}
function subGoal(){
  setNumberGoal(numberGoal-1)
}


  return(
    <View style={styles.container}>

<View style={styles.viewHeader}>
        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#414141" />
        </TouchableOpacity>
        <Text style={[styles.title, {color: '#212121', fontSize: 18,}]}>
          Minha meta
        </Text>
        <TouchableOpacity style={[styles.buttonBack, {backgroundColor:'transparent'}]} >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>
    </View>

<View style={styles.contentText}> 
      <Text style={styles.title}>
        Uma streak representa seu compromisso com a rotina de estudos. 
           Ela é a sequência de boosts que você recebeu. Para ter uma streak você deve: {'\n'}
                <Text> {'\n'}- Estudar por dias seguidos, ou {'\n'}</Text>
              <Text> {'\n'} - Atingir a sua metal semanal de flashcards {'\n'}</Text> 
           <Text style={styles.title}>
           {'\n'}
           A meta semanal serve para você criar uma rotina de estudos na plataforma. 
         Com a meta, você escolhe quantas palavras quer memorizar na semana e se comprometerá a estudar os flashcards.
      </Text>
   </Text>
   </View>

   <Text style={styles.textH2}> Escolha aqui quantos flashcards quer memorizar por semana:</Text>

<View style={styles.viewPick}>
  <TouchableOpacity style={styles.buttonPicker} onPress={subGoal}>
     <Text style={styles.textPicker}>-</Text>
  </TouchableOpacity>
  <Text style={styles.numberPicker}> {numberGoal} </Text>
  <TouchableOpacity style={styles.buttonPicker} onPress={plusGoal}>
     <Text style={styles.textPicker}>+</Text>
  </TouchableOpacity>
</View>

<TouchableOpacity style={styles.buttonSave} onPress={ () => navigation.goBack() }>
  <Text style={styles.textSave}>Salvar</Text>
</TouchableOpacity>
    </View>
  )
}