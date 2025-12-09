import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question2">;

const ORIGINAL_WORDS = ["Face", "Velvet", "Church", "Daisy"];
const DISTRACTORS = ["River", "Window", "Tiger", "Bottle"];

export default function Question2({ navigation }: Props) {
  const [phase, setPhase] = useState<"show" | "recall">("show");
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  useEffect(() => {
    // store original words earlier for later delayed recall scoring
    if (useQuizStore.getState().answers.wordList.length === 0) {
      setQuizAnswer("wordList", ORIGINAL_WORDS);
    }

    const timer = setTimeout(() => {
      const shuffled = [...ORIGINAL_WORDS, ...DISTRACTORS]
        .sort(() => Math.random() - 0.5);
      setChoices(shuffled);
      setPhase("recall");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const toggleSelect = (word: string) => {
    setSelected((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };

  const handleNext = () => {
    setQuizAnswer("Question2", selected);
    navigation.navigate("Question3");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 2 / 5</Text>

      {phase === "show" ? (
        <>
          <Text style={styles.question}>Memorize the following words:</Text>

          <View style={styles.wordBox}>
            {ORIGINAL_WORDS.map((w) => (
              <Text key={w} style={styles.wordItem}>{w}</Text>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.question}>Select the 4 words you saw earlier:</Text>

          <View style={styles.choiceBox}>
            {choices.map((w) => (
              <TouchableOpacity
                key={w}
                style={[
                  styles.choiceItem,
                  selected.includes(w) && styles.selected,
                ]}
                onPress={() => toggleSelect(w)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selected.includes(w) && styles.selectedText,
                  ]}
                >
                  {w}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, selected.length !== 4 && { opacity: 0.4 }]}
            disabled={selected.length !== 4}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#ffffff" },
  progress: { textAlign: "center", color: "#6b7280", marginBottom: 12 },
  question: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  wordBox: { flexDirection: "row", justifyContent: "center", gap: 10, flexWrap: "wrap" },
  wordItem: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: "700",
  },
  choiceBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  choiceItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  selected: { backgroundColor: "#1d4ed8" },
  choiceText: { fontSize: 16, fontWeight: "600", color: "#111" },
  selectedText: { color: "#fff" },
  button: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

/*import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question2">;

const ORIGINAL_WORDS = ["Face", "Velvet", "Church", "Daisy"];
const DISTRACTORS = ["Tiger", "Window", "Apple", "River"];

export default function Question2({ navigation }: Props) {
  // PHASE STATES
  const [phase1, setPhase1] = useState(true); 
  const [phase3, setPhase3] = useState(false);


  // STATES FOR TAP SELECTION
  const [phase2Words, setPhase2Words] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  // PHASE 1 → PHASE 2
  useEffect(() => {
    if (useQuizStore.getState().answers.wordList.length === 0) {
    setQuizAnswer("wordList", ORIGINAL_WORDS);
  }

    const timer = setTimeout(() => {
      setPhase1(false);
      const shuffled = [...ORIGINAL_WORDS, ...DISTRACTORS.slice(0, 2)].sort(
      () => Math.random() - 0.5
    );
    setPhase2Words(shuffled);

    setPhase3(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // SELECT HANDLER
  const toggleSelect = (word: string) => {
    setSelected((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };


  // FINAL SUBMIT
  const handleNext = () => {

    setQuizAnswer("Question2", selected);
    navigation.navigate("Question3");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 2 / 5</Text>

      {phase1 ? (
        <>
          <Text style={styles.question}>Memorize these words:</Text>

          <View style={styles.wordBox}>
            {ORIGINAL_WORDS.map((w) => (
              <Text key={w} style={styles.wordItem}>
                {w}
              </Text>
            ))}
          </View>
        </>
      ) : (

        <>
          <Text style={styles.question}>Now tap the 4 words shown earlier:</Text>

          <View style={styles.choiceBox}>
            {phase2Words.map((w) => (
              <TouchableOpacity
                key={w}
                style={[
                  styles.choiceItem,
                  selected.includes(w) && styles.selectedItem,
                ]}
                onPress={() => toggleSelect(w)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selected.includes(w) && styles.selectedText,
                  ]}
                >
                  {w}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              selected.length !== 4 && { opacity: 0.4 },
            ]}
            disabled={selected.length !== 4}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
  },
  progress: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 12,
  },
  question: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  wordBox: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  wordItem: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    margin: 6,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: "700",
    elevation: 2,
  },
  input: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    fontSize: 16,
    marginBottom: 20,
  },
  choiceBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  choiceItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: "#2563eb",
  },
  choiceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  selectedText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});


*/
