import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AuthScreen from "./src/screens/AuthScreen";
import { useSession } from "./src/lib/useSession";
import { initDb } from "./src/lib/db";
import { theme } from "./src/theme/theme";

import HomeScreen from "./src/screens/HomeScreen";
import LogScreen from "./src/screens/LogScreen";
import JournalScreen from "./src/screens/JournalScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import ExploreScreen from "./src/screens/ExploreScreen";

export type TabsParamList = {
  Home: undefined;
  Log: undefined;
  Journal: undefined;
  Community: undefined;
  Explore: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function App() {
  useEffect(() => {
    initDb();
  }, []);

  const { session, ready } = useSession();

  if (!ready) return null;

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.blue,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarStyle: {
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.bg,
          },
          tabBarIcon: ({ color, size }) => {
            const name =
              route.name === "Home"
                ? "home"
                : route.name === "Log"
                ? "clipboard"
                : route.name === "Journal"
                ? "book"
                : route.name === "Community"
                ? "chatbubbles"
                : "compass";
            return <Ionicons name={name as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Log" component={LogScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
