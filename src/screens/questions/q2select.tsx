import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

const ORIGINAL_WORDS = ["Face", "Velvet", "Church", "Daisy"];
const DISTRACTORS = ["River", "Window", "Tiger", "Bottle"];

type Props = NativeStackScreenProps<RootStackParamList, "Question2Select">;

function Question2Select({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  
  // Move shuffling to useMemo to prevent re-shuffling on re-renders
  const shuffled = useMemo(
    () => [...ORIGINAL_WORDS, ...DISTRACTORS].sort(() => Math.random() - 0.5),
    []
  );

  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  const toggle = (word: string) => {
    setSelected((prev) =>
      prev.includes(word) ? prev.filter((x) => x !== word) : [...prev, word]
    );
  };

  const next = () => {
    setQuizAnswer("Question2", selected);
    navigation.navigate("Question3");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 2 / 5</Text>
      <Text style={styles.question}>Tap the 4 words you saw earlier:</Text>

      <View style={styles.choiceBox}>
        {shuffled.map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.choiceItem, selected.includes(w) && styles.selected]}
            onPress={() => toggle(w)}
          >
            <Text style={[styles.choiceText, selected.includes(w) && styles.selText]}>
              {w}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, selected.length !== 4 && { opacity: 0.4 }]}
        disabled={selected.length !== 4}
        onPress={next}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  progress: { textAlign: "center", marginBottom: 12, color: "#666" },
  question: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  choiceBox: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 20 },
  choiceItem: { padding: 12, backgroundColor: "#eee", borderRadius: 12 },
  selected: { backgroundColor: "#2563eb" },
  choiceText: { fontSize: 16, fontWeight: "600", color: "#111" },
  selText: { color: "#fff" },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default Question2Select;

/*import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

const ORIGINAL_WORDS = ["Face", "Velvet", "Church", "Daisy"];
const DISTRACTORS = ["River", "Window", "Tiger", "Bottle"];

type Props = NativeStackScreenProps<RootStackParamList, "Question2Select">;

export default function Question2Select({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const shuffled = [...ORIGINAL_WORDS, ...DISTRACTORS].sort(() => Math.random() - 0.5);

  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  const toggle = (word: string) => {
    setSelected((prev) =>
      prev.includes(word) ? prev.filter((x) => x !== word) : [...prev, word]
    );
  };

  const next = () => {
    setQuizAnswer("Question2", selected);
    navigation.navigate("Question3");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 2 / 5</Text>
      <Text style={styles.question}>Tap the 4 words you saw earlier:</Text>

      <View style={styles.choiceBox}>
        {shuffled.map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.choiceItem, selected.includes(w) && styles.selected]}
            onPress={() => toggle(w)}
          >
            <Text style={[styles.choiceText, selected.includes(w) && styles.selText]}>
              {w}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, selected.length !== 4 && { opacity: 0.4 }]}
        disabled={selected.length !== 4}
        onPress={next}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  progress: { textAlign: "center", marginBottom: 12, color: "#666" },
  question: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  choiceBox: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  choiceItem: { padding: 12, backgroundColor: "#eee", borderRadius: 12 },
  selected: { backgroundColor: "#2563eb" },
  choiceText: { fontSize: 16, fontWeight: "600" },
  selText: { color: "#fff" },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
*/