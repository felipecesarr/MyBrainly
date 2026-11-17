import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/App/Home";
import WebViewScreen from "../../screens/App/MySubscription/webView";


const Stack = createNativeStackNavigator()

export default function StackHome(){
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false }}
      >
      <Stack.Screen name="Home" component={Home}/>
      <Stack.Screen name="WebView" component={WebViewScreen}/>
    </Stack.Navigator>

  )
}