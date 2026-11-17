import 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Tabs from '../tabs/index';
import MyDecks from '../../screens/App/MyDecks';
import MyDatas from '../../screens/App/MyDatas';
import MySubscription from '../../screens/App/MySubscription';
import CustomDrawer from '../../components/CustomDrawer';
import LoggedStack from '../loggedStack';
import Analytics from '../../screens/App/Analytics';

export default function Drawer(){
  const Drawer = createDrawerNavigator();
  return(
    <Drawer.Navigator
    drawerContent={(props) => <CustomDrawer {...props}/>}
    screenOptions={{
      headerShown: false,
      drawerActiveBackgroundColor: '#F9E2FD',
      drawerActiveTintColor: '#CB48DF',
    }}>
      <Drawer.Screen name='Início' component={Tabs}/>
      <Drawer.Screen name='Progresso' component={Analytics}/>
      <Drawer.Screen name='Meus Decks' component={MyDecks}/>
      <Drawer.Screen name='Minha conta' component={MyDatas}/>
      <Drawer.Screen name='Assinatura' component={MySubscription}/>
      <Drawer.Screen name='LoggedStack' component={LoggedStack} 
      options={{
      // Maneiras de esconder do Drawer:
      drawerItemStyle: { display: "none" },
      // ou drawerLabel: () => null,
      // ou title: '',
    }}/>
    </Drawer.Navigator>
  )
}
