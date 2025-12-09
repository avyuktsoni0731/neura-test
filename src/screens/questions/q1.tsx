import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator"; 
import { useQuizStore } from '../../store/quizStore';

type Props = NativeStackScreenProps<RootStackParamList, "Question1">;

export default function Question1({ navigation }: Props) {
  const [answer, setAnswer] = useState("");
  const setQuizAnswer = useQuizStore((state) => state.setAnswer);

  const handleNext = () => {
    console.log("Answer to Question 1:", answer);
    setQuizAnswer("Question1", answer.trim());
    navigation.navigate("Question2");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 1 / 5</Text>
      <Text style={styles.questionText}>1. What is today's date (DD-MM-YYYY)?</Text>

      <TextInput
        placeholder="e.g. 05-12-2025"
        placeholderTextColor="#888"
        value={answer}
        onChangeText={setAnswer}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  progress: { textAlign: "center", color: "#6b7280", marginBottom: 12 },
  questionText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: "#fff",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: "brown",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
