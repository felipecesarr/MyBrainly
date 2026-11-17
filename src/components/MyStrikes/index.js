import { View, Text } from "react-native";
import { styles } from "./styles";
import { Fontisto } from '@expo/vector-icons';

export default function MyStrikes() {
  return(
    <View style={styles.container}>

      <View style={styles.ViewHeader}>
        <View style={styles.ViewFire}>
          <View style={styles.viewIcon}> 
             <Fontisto name="fire" size={20} color="#F194FF" />
          </View>
          <Text style={styles.textHeader}> Meus Streaks </Text>
        </View>
        <View style={[styles.ViewFire, {gap: 0}]}>
          <Text style={styles.textCount}> 12 </Text>
            <Text style={styles.textCount}> / </Text>
          <Text style={styles.textCount}> 250 </Text>
        </View>
      </View>
      
      <View style={styles.viewDays}> 
        <View style={styles.countDays}>
          <Text style={styles.day}>S</Text>
          <Text style={styles.day}>0</Text>
        </View>
        <View style={styles.countDays}>
          <Text style={styles.day}>T</Text>
          <Text style={styles.day}>0</Text>
        </View>
        <View style={styles.countDays}>
          <Text style={styles.day}>Q</Text>
          <Text style={styles.day}>0</Text>
        </View>
        <View style={styles.countDays}>
          <Text style={styles.day}>Q</Text>
          <Text style={styles.day}>0</Text>
        </View>
        <View style={styles.countDays}>
          <Text style={styles.day}>S</Text>
          <Text style={styles.day}>0</Text>
        </View>
        <View style={styles.countDays}>
          <Text style={styles.day}>S</Text>
          <Text style={styles.day}>0</Text>
        </View>
        <View style={styles.countDays}>
          <Text style={styles.day}>D</Text>
          <Text style={styles.day}>0</Text>
        </View>
      </View>

    </View>
  )
}