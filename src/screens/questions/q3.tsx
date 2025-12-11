// src/screens/questions/q3.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/appNavigator';
import { useQuizStore } from '../../store/quizStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Question3'>;

const DIGITS = [5, 8, 1, 3]; // clinically accurate backward recall set

export default function Question3({ navigation, route }: Props) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState('');
  const [showDigits, setShowDigits] = useState(true); // digits visible initially
  const setQuizAnswer = useQuizStore(s => s.setAnswer);
  const { patient } = route.params;

  useEffect(() => {
    // hide digits after 3 seconds
    const timer = setTimeout(() => setShowDigits(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setQuizAnswer('Question3', answer.trim());
    navigation.navigate('Question4', { patient });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('questions.question')} 3 {t('questions.of')} 5
      </Text>

      <Text style={styles.title}>{t('questions.digitSpanTitle')}</Text>

      <Text style={styles.question}>{t('questions.digitSpanInstruction')}</Text>

      {/* Digits shown only for 3 seconds */}
      {showDigits ? (
        <View style={styles.digitBox}>
          <Text style={styles.digits}>{DIGITS.join('   ')}</Text>
        </View>
      ) : (
        <>
          <TextInput
            placeholder={t('questions.digitSpanPlaceholder')}
            value={answer}
            onChangeText={setAnswer}
            style={styles.input}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{t('common.next')}</Text>
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
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
  },
  progress: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  question: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 16,
    color: '#374151',
  },
  digitBox: { alignItems: 'center', marginBottom: 20 },
  digits: { fontSize: 28, fontWeight: '900', letterSpacing: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 26,
    elevation: 2,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

// src/screens/questions/q3.tsx
/*
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question3">;

// Clinically meaningful digit span set (length 4 is accurate)
const DIGITS = [5, 8, 1, 3];

export default function Question3({ navigation }: Props) {
  const [answer, setAnswer] = useState("");
  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  const handleNext = () => {
    setQuizAnswer("Question3", answer.trim());
    navigation.navigate("Question4");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 3 / 5</Text>

      <Text style={styles.title}>Digit Span — Backward Recall</Text>

      <Text style={styles.question}>
        I will show you a sequence of numbers.  
        Please enter them **in reverse order**.
      </Text>

      <View style={styles.digitBox}>
        <Text style={styles.digits}>{DIGITS.join("   ")}</Text>
      </View>

      <TextInput
        placeholder="Type the numbers backward (e.g., 3185)"
        value={answer}
        onChangeText={setAnswer}
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor="#888"
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
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
  },
  progress: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  question: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 16,
    color: "#374151",
  },
  digitBox: { alignItems: "center", marginBottom: 20 },
  digits: { fontSize: 26, fontWeight: "800", letterSpacing: 8 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 26,
    elevation: 2,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
*/
/*
// src/screens/questions/q3.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question3">;

const DIGITS = [7, 4, 2, 9]; // example

export default function Question3({ navigation }: Props) {
  const [answer, setAnswer] = useState("");
  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  const handleNext = () => {
    setQuizAnswer("Question3", answer.trim());
    navigation.navigate("Question4");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Question 3 / 5</Text>
      <Text style={styles.question}>3. Repeat these numbers backwards:</Text>

      <View style={styles.digitBox}>
        <Text style={styles.digits}>{DIGITS.join("  ")}</Text>
      </View>

      <TextInput
        placeholder="Type the numbers backwards (e.g., 9247)"
        value={answer}
        onChangeText={setAnswer}
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f0fdf4", justifyContent: "center" },
  progress: { textAlign: "center", color: "#6b7280", marginBottom: 12 },
  question: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  digitBox: { alignItems: "center", marginBottom: 18 },
  digits: { fontSize: 22, fontWeight: "800", letterSpacing: 8 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 26,
    elevation: 2,
  },
  button: { backgroundColor: "#2563eb", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
*/
