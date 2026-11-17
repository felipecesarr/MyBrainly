import { View, TouchableOpacity } from "react-native";
import { Entypo, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { styles } from "./styles";

export default function MyTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let IconComponent;
          let iconName;
          let iconSize = 34;

          if (route.name === 'StackHome') {
            IconComponent = Entypo;
            iconName = "home";
          } else if (route.name === 'FlashCards') {
            IconComponent = FontAwesome6;
            iconName = "brain";
            iconSize = isFocused ? 44 : 34;
          } else if (route.name === 'Explorer') {
            IconComponent = AntDesign;
            iconName = "appstore1";
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.buttonTab}
            >

              <View style={{padding: 14, backgroundColor: isFocused ? '#F9E2FD' : "transparent", borderRadius: 50}}>
              <IconComponent
                name={iconName}
                size={iconSize}
                color={isFocused ? "#F194FF" : "#dcdcdc"}
              />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
