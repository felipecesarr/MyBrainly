import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CreateDeck from "../../screens/App/CreateDeck";
import Creater from "../../screens/App/CreateDeck/create";
import GenerateIa from "../../screens/App/CreateDeck/generateIa";

const Stack = createNativeStackNavigator()

export default function LoggedStack(){
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false }}
      >
        <Stack.Screen name="CreateDeck" component={CreateDeck}/>
        <Stack.Screen name="Creater" component={Creater}/>
        <Stack.Screen name="GenerateIa" component={GenerateIa}/>
    </Stack.Navigator>

  )
}