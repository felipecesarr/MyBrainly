import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FlashCards from "../../screens/App/FlashCards";
import Explorer from '../../screens/App/Explorer';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import MyTabBar from "../../components/MyTabBar";
import StackHome from "../stackHome";
import { useRevenueCat } from "../../contexts/RevenueCatContext";
import { useEffect, useState } from "react";
import Paywall from "../../screens/App/MySubscription/paywall";
import { View, ActivityIndicator } from "react-native";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const { user, isLoading } = useRevenueCat();
  const [showPaywall, setShowPaywall] = useState(true);
  
  // Verifica se o usuário tem assinatura ativa
  useEffect(() => {
    if (user && user.plus) {
      setShowPaywall(false);
    } else {
      setShowPaywall(false);
    }
  }, [user]);

  // Enquanto está carregando, mostra um indicador
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F194FF" />
      </View>
    );
  }

  // Se não for assinante, mostra o paywall
  if (showPaywall) {
    return <Paywall onSubscriptionSuccess={() => setShowPaywall(false)} />;
  }
  
  // Se for assinante, mostra as abas normalmente
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tab.Screen
        name="StackHome"
        component={StackHome}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Entypo name="home" size={34} color={focused ? "#F194FF" : "#dcdcdc"} />
          ),
        }}
      />
      <Tab.Screen
        name="FlashCards"
        component={FlashCards}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome6 name="brain" size={focused ? 54 : 44} color={focused ? "#F194FF" : "#dcdcdc"} />
          ),
        }}
      />
      <Tab.Screen
        name="Explorer"
        component={Explorer}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign name="appstore1" size={34} color={focused ? "#F194FF" : "#dcdcdc"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}