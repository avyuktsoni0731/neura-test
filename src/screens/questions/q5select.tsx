// src/screens/questions/q5select.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question5Select">;

const GRID_SIZE = 3; // 3x3 grid
const TOTAL_POINTS = 4; // Must select 4 circles

export default function Question5Select({ navigation }: Props) {
  const { t } = useTranslation();
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const setQuizAnswer = useQuizStore((s) => s.setAnswer);
  const getQuizAnswer = useQuizStore((s) => s.answers);

  const handleSelect = (index: number) => {
    setSelectedPositions((prev) => {
      if (prev.includes(index)) {
        // Deselect
        return prev.filter((x) => x !== index);
      } else if (prev.length < TOTAL_POINTS) {
        // Select (only if less than 4 selected)
        return [...prev, index];
      }
      return prev;
    });
  };

  const handleFinish = () => {
    const shownPositions = getQuizAnswer.Question5.shown || [];
    const correct = selectedPositions.filter((pos) => 
      shownPositions.includes(pos)
    ).length;

    setQuizAnswer("Question5", {
      shown: shownPositions,
      selected: selectedPositions,
      correctCount: correct,
    });

    navigation.navigate("TestResult");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('questions.question')} 5 {t('questions.of')} 5
      </Text>

      <Text style={styles.question}>
        {t('questions.spatialRecall') || 'Select where the circles were'}
      </Text>

      <Text style={styles.instruction}>
        {t('questions.spatialRecallInstruction') || `Tap ${TOTAL_POINTS} cells where you saw circles`}
      </Text>

      <Text style={styles.counter}>
        Selected: {selectedPositions.length} / {TOTAL_POINTS}
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const isSelected = selectedPositions.includes(index);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(index)}
              style={[
                styles.cell,
                isSelected && styles.selected,
              ]}
            >
              {isSelected && <View style={styles.selectedCircle} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[
          styles.button,
          selectedPositions.length !== TOTAL_POINTS && { opacity: 0.4 }
        ]} 
        onPress={handleFinish}
        disabled={selectedPositions.length !== TOTAL_POINTS}
      >
        <Text style={styles.buttonText}>
          {t('questions.finishTest') || 'Finish Test'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: "center", 
    backgroundColor: "#f0f9ff" 
  },
  progress: { 
    textAlign: "center", 
    marginBottom: 10, 
    color: "#6b7280" 
  },
  question: { 
    fontSize: 20, 
    fontWeight: "700", 
    textAlign: "center", 
    marginBottom: 12 
  },
  instruction: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  counter: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 20,
  },
  grid: {
    width: 300,
    height: 300,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cell: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  selected: {
    backgroundColor: "#dbeafe",
  },
  selectedCircle: {
    width: 60,
    height: 60,
    backgroundColor: "#2563eb",
    borderRadius: 30,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },
});