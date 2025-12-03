import React from 'react';
import { View, Text, StyleSheet, Switch } from "react-native";

export default function SettingsScreen(){
    const[notifications, setNotifications] = React.useState(true);

    return(
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>
        <View style={styles.row}>
        <Text style={styles.label}>Notifications</Text>
        <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={notifications ? "#007bff" : "#ccc"}
        />
        </View>
        <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
            value={false}
            thumbColor={"#ccc"}
        />
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    label: {
        fontSize: 18,
    },
});