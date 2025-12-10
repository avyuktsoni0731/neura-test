import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, "DelayTimer">;

export default function DelayTimer({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { nextScreen, durationMinutes = 10, questionNumber } = route.params;
  const TOTAL_TIME = durationMinutes * 60; // Convert to seconds
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME);

  useFocusEffect(
  useCallback(() => {
    setSecondsLeft(TOTAL_TIME); // reset timer every time screen focuses
  }, [TOTAL_TIME])
);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          navigation.navigate(nextScreen as any);
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigation, nextScreen]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('questions.delayedRecall') || 'Delayed Recall'}</Text>
      {questionNumber && (
        <Text style={styles.questionInfo}>
          {t('questions.question')} {questionNumber}
        </Text>
      )}
      <Text style={styles.subtitle}>
        {t('questions.waitNextTask') || 'Please wait for the next task.'}
      </Text>

      <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate(nextScreen as any)}
      >
        <Text style={styles.skipText}>{t('common.skip') || 'Skip'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
  },
  questionInfo: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  timer: {
    fontSize: 48,
    fontWeight: "900",
    marginVertical: 20,
    letterSpacing: 2,
  },
  skipButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
  },
  skipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
// src/screens/questions/Question2Delay.tsx
/*
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Question2Delay">;

export default function Question2Delay({ navigation }: Props) {
  const TOTAL_TIME = 10 * 60; // 10 minutes in seconds
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          navigation.navigate("Question2Select"); // auto-move after 10 mins
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delayed Recall</Text>
      <Text style={styles.subtitle}>
        Please wait for the next task.
      </Text>

      <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("Question2Select")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  timer: {
    fontSize: 48,
    fontWeight: "900",
    marginVertical: 20,
    letterSpacing: 2,
  },
  skipButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
  },
  skipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
*/
