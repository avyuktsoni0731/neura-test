// src/screens/questions/q5.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question5">;

const GRID_SIZE = 3; // 3x3 grid
const TOTAL_POINTS = 4; // 4 circles shown

export default function Question5({ navigation }: Props) {
  const [shownPositions, setShownPositions] = useState<number[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [step, setStep] = useState<"show" | "recall">("show");

  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  useEffect(() => {
    generateRandomPositions();
  }, []);

  const generateRandomPositions = () => {
    let positions: number[] = [];
    while (positions.length < TOTAL_POINTS) {
      const random = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      if (!positions.includes(random)) positions.push(random);
    }
    setShownPositions(positions);

    setTimeout(() => {
      setStep("recall");
    }, 2000); // show for 2 seconds
  };

  const handleSelect = (index: number) => {
    if (step === "recall") {
      setSelectedPositions((prev) =>
        prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index]
      );
    }
  };

  const handleFinish = () => {
    const correct = selectedPositions.filter((pos) => shownPositions.includes(pos)).length;

    setQuizAnswer("Question5", {
      shown: shownPositions,
      selected: selectedPositions,
      correctCount: correct,
    });

    navigation.navigate("TestResult");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 5 / 5</Text>

      <Text style={styles.question}>
        5. Remember the positions of the circles.
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const isCircleVisible = step === "show" && shownPositions.includes(index);
          const isSelected = step === "recall" && selectedPositions.includes(index);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(index)}
              style={[
                styles.cell,
                isCircleVisible && styles.circle,
                isSelected && styles.selected,
              ]}
            />
          );
        })}
      </View>

      {step === "recall" && (
        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>Finish Test</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#f0f9ff" },
  progress: { textAlign: "center", marginBottom: 10, color: "#6b7280" },
  question: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  grid: {
    width: 300,
    height: 300,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    backgroundColor: "#60a5fa",
    borderRadius: 50,
  },
  selected: {
    backgroundColor: "#2563eb",
  },
  button: {
    marginTop: 26,
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

