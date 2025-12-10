// src/screens/questions/q5.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question5">;

const GRID_SIZE = 3; // 3x3 grid
const TOTAL_POINTS = 4; // 4 circles shown

export default function Question5({ navigation }: Props) {
  const { t } = useTranslation();
  const [shownPositions, setShownPositions] = useState<number[]>([]);
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

    // Store the positions for later scoring
    setQuizAnswer("Question5", {...useQuizStore.getState().answers.Question5, shown: positions});

    // Show for 3 seconds, then navigate to timer
    setTimeout(() => {
      navigation.navigate("DelayTimer", {
        nextScreen: "Question5Select",
        durationMinutes: 10,
        questionNumber: 5
      });
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('questions.question')} 5 {t('questions.of')} 5
      </Text>

      <Text style={styles.question}>
        {t('questions.spatialMemory') || 'Memorize the positions of the circles'}
      </Text>

      <Text style={styles.instruction}>
        {t('questions.spatialInstruction') || 'Remember where the blue circles are located'}
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const isCircleVisible = shownPositions.includes(index);

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isCircleVisible && styles.circle,
              ]}
            />
          );
        })}
      </View>
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
    marginBottom: 24,
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
  circle: {
    backgroundColor: "#60a5fa",
    borderRadius: 50,
    margin: 10,
  },
});
