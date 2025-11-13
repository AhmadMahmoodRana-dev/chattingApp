import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home/HomeScreen";
import ChatScreen from "../screens/Home/ChatScreen";
import ProfileScreen from "../screens/Home/ProfileScreen";
import { Ionicons } from '@react-native-vector-icons/ionicons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarStyle: {
        backgroundColor: "#121212", // tab bar background
        borderTopWidth: 0,
        elevation: 10,
        height: 60,
      },
      tabBarActiveTintColor: "#25D366", // active icon/text color
      tabBarInactiveTintColor: "#aaa", // inactive icon/text color
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 5,
      },
      tabBarIcon: ({ color, focused, size }) => {
        let iconName;
        if (route.name === "Chats") {
          iconName = focused ? "chatbubble" : "chatbubble-outline";
        }
        return <Ionicons name={iconName} size={22} color={color} />;
      },
      tabBarItemStyle: {
        backgroundColor: route.name === "Chats" ? "transparent" : "transparent",
      },
    })}
  >
    <Tab.Screen
      name="Chats"
      component={HomeScreen}
      options={{
        tabBarActiveBackgroundColor: "#1e1e1e", // Active tab background
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarActiveBackgroundColor: "#1e1e1e", // Active tab background
      }}
    />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
  </Stack.Navigator>
);

export default MainNavigator;
