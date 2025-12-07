import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function NewSessionScreen({ navigation }) {
    return (
    <View style={styles.container}>
        <Text style={styles.header}>New Session</Text>
        <Text style={styles.subText}>
            Start a new therapy session with a patient.
        </Text>

        <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Start Manually</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.secondaryBtn]}>
            <Text style={[styles.btnText, styles.secondaryText]}>
            Choose Existing Patient
            </Text>
        </TouchableOpacity>
    </View>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
},
header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
},
subText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
},
btn: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
},
btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
},
secondaryBtn: {
    backgroundColor: "#f1f1f1",
},
secondaryText: {
    color: "#333",
},
});
