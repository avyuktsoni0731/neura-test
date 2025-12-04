/*import React from "react";
import { Animated, TouchableOpacity, StyleSheet } from "react-native";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/home.js";
import SettingsScreen from "../screens/settings.js"
import NewSessionScreen from "../screens/newSession.js";

console.log("Home:", HomeScreen);
console.log("Settings:", SettingsScreen);
console.log("NewSession:", NewSessionScreen);

export default function BottomTabs() {

  const getIcon = (routeName) => {
    switch (routeName) {
      case "Home": return "home-outline";
      case "Settings": return "settings-outline";
      default: return "ellipse-outline";
    }
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => (
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

  return (
    <CurvedBottomBar.Navigator
      id="main-bottom-bar"
      type="UP"
      bgColor="white"
      height={65}
      width={undefined}
      circleWidth={60}
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
      borderTopLeftRight
      borderColor="#eee"
      borderWidth={1}
      backBehavior="initialRoute"
      screenListeners={{}}
      style={styles.container}
      renderCircle={({ navigate }) => (
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
\
      <CurvedBottomBar.Screen
        name="Home"
        component={HomeScreen}
        position="LEFT"
      />

\
      <CurvedBottomBar.Screen
        name="Settings"
        component={SettingsScreen}
        position="RIGHT"
      />
      <CurvedBottomBar.Screen
        name="NewSession"
        component={NewSessionScreen}

/>


    </CurvedBottomBar.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
*/

/*// navbar.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// TEMPORARY stub component to test
export default function BottomTabs() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        BottomTabs test component (CurvedBottomBar commented out)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
  },
});
*/
// src/navigataion/navbar.js

/*
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BottomTabs() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>BottomTabs test component</Text>
    </View>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: { fontSize: 18 },
});
*/

/*import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
// or: import CurvedBottomBar from "react-native-curved-bottom-bar";
// depending on what your docs say
import HomeScreen from "../screens/home.js";
import SettingsScreen from "../screens/settings.js";
import NewSessionScreen from "../screens/newSession.js";

console.log("CurvedBottomBar value:", CurvedBottomBar);
console.log("Home type:", typeof HomeScreen);
console.log("Settings type:", typeof SettingsScreen);
console.log("NewSession type:", typeof NewSessionScreen);

export default function BottomTabs() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>BottomTabs still in test mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: { fontSize: 18 },
});
*/

/*
import React from "react";
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/home.js";
import SettingsScreen from "../screens/settings.js";
import NewSessionScreen from "../screens/newSession.js";

const getIcon = (routeName) => {
  switch (routeName) {
    case "Home":
      return "home-outline";
    case "Settings":
      return "settings-outline";
    default:
      return "ellipse-outline";
  }
};

const renderTabBar = ({ routeName, selectedTab, navigate }) => (
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

export default function BottomTabs() {
  return (
    <CurvedBottomBar.Navigator
      type="UP"
      bgColor="white"
      height={65}
      circleWidth={60}
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
      borderTopLeftRight
      style={styles.container}
      renderCircle={({ navigate }) => (
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
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
*/

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
