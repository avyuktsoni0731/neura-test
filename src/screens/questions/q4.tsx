
// src/screens/questions/q4.tsx
import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question4">;

export default function Question4({ navigation }: Props) {
  const [name, setName] = useState("");
  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  const handleNext = () => {
    setQuizAnswer("Question4", name.trim());
    navigation.navigate("Question5");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 4 / 5</Text>
      <Text style={styles.question}>4. Look at this picture. What is it?</Text>

      <View style={styles.imageWrap}>
        {/* Put an image at src/assets/lion.png or change this path */}
        <Image source={require("../../../assets/lion.png")} style={styles.image} resizeMode="contain" />
      </View>

      <TextInput
        placeholder="Type the name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fffaf0", justifyContent: "center" },
  progress: { textAlign: "center", color: "#6b7280", marginBottom: 12 },
  question: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  imageWrap: { alignItems: "center", marginBottom: 16 },
  image: { width: 200, height: 140, borderRadius: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 26,
  },
  button: { backgroundColor: "#2563eb", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
