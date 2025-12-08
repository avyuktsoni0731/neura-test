import React from "react";
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/home.tsx";
import SettingsScreen from "../screens/settings.tsx";
import NewSessionScreen from "../screens/newSession.tsx";

const getIcon = (routeName: string): string => {
  switch (routeName) {
    case "Home":
      return "home-outline";
    case "Settings":
      return "settings-outline";
    default:
      return "ellipse-outline";
  }
};

type RenderTabBarProps = {
  routeName: string;
  selectedTab: string;
  navigate: (routeName: string) => void;
};

const renderTabBar = ({ routeName, selectedTab, navigate }: RenderTabBarProps) => (
  <TouchableOpacity
    style={styles.tabItem}
    onPress={() => navigate(routeName)}
  >
    <Ionicons
      name={getIcon(routeName)}
      size={28}
      color={selectedTab === routeName ? "#007bff" : "#777"}
    />
  </TouchableOpacity>
);

const BottomTabs: React.FC = () => {
  return (
    <CurvedBottomBar.Navigator
    id="bottomTabs"
  type="UP"
  bgColor="white"
  height={50}
  circleWidth={60}
  circlePosition="CENTER" 
  screenOptions={{ headerShown: false }}
  initialRouteName="Home"
  borderTopLeftRight={true}
  style={styles.container}
  borderColor="transparent" 
  borderWidth={0} 
  shadowStyle={{}} 
  screenListeners={{}} 
  defaultScreenOptions={{}} 
  backBehavior="none"
  renderCircle={({ navigate }: { navigate: (routeName: string) => void }) => (
    <Animated.View style={styles.centerCircle}>
      <TouchableOpacity
        onPress={() => navigate("NewSession")}
        style={styles.centerButton}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </Animated.View>
  )}
  tabBar={renderTabBar}
>

      <CurvedBottomBar.Screen
        name="Home"
        position="LEFT"
        component={HomeScreen}
      />
      <CurvedBottomBar.Screen
        name="Settings"
        position="RIGHT"
        component={SettingsScreen}
      />
      <CurvedBottomBar.Screen
        name="NewSession"
        position="CENTER"
        component={NewSessionScreen}
      />
    </CurvedBottomBar.Navigator>
  );
};


export default BottomTabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    width: '100%',
  },
  tabItem: {
    flex: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    width: '100%',
  },
  centerCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    bottom: 25,
    elevation: 5,
  },
  centerButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
