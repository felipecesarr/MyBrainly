import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Onboarding from "../../screens/Onboarding";
import SignIn from "../../screens/SignIn";
import SignUp from "../../screens/SignUp";
import Payment from "../../screens/Payment";

const Stack = createNativeStackNavigator();

export default function MyStack(){
  return(
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={{
      headerShown: false,
    }}>
     <Stack.Screen name="Onboarding" component={Onboarding}/>
      <Stack.Screen name="SignIn" component={SignIn}/>
      <Stack.Screen name="SignUp" component={SignUp}/>
      <Stack.Screen name="Payment" component={Payment}/>
    </Stack.Navigator>
  )
}