import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/appNavigator';
import { useQuizStore } from '../../store/quizStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Question1'>;

export default function Question1({ navigation, route }: Props) {
  const { patient } = route.params;
  const { t } = useTranslation();
  const [answer, setAnswer] = useState('');
  const setQuizAnswer = useQuizStore(state => state.setAnswer);

  const formatDate = (text: string) => {
    // Remove anything that's not a digit
    const cleaned = text.replace(/\D/g, '');

    let formatted = cleaned;

    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(
        2,
        4,
      )}-${cleaned.slice(4, 8)}`;
    }

    return formatted.slice(0, 10); // always limit to DD-MM-YYYY
  };

  const handleNext = () => {
    console.log('Answer to Question 1:', answer);
    setQuizAnswer('Question1', answer.trim());
    navigation.navigate('Question2', { patient });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('questions.question')} 1 {t('questions.of')} 5
      </Text>

      <Text style={styles.questionText}>1. {t('questions.enterDate')}</Text>

      <TextInput
        keyboardType="numeric"
        placeholder={t('questions.datePlaceholder')}
        placeholderTextColor="#aaa"
        value={answer}
        maxLength={10}
        onChangeText={text => setAnswer(formatDate(text))}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, answer.length !== 10 && styles.buttonDisabled]}
        disabled={answer.length !== 10}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>{t('common.next')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },
  progress: {
    textAlign: 'center',
    color: '#7a7a7a',
    marginBottom: 12,
    fontSize: 16,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#222',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 14,
    padding: 16,
    fontSize: 20,
    backgroundColor: '#fff',
    marginBottom: 25,
    letterSpacing: 1,
    elevation: 2,
  },
  button: {
    backgroundColor: 'brown',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

/*
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
  progress: { textAlign: "center", color: "#6b7280", marginBottom: 12, fontSize: 16 },
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
*/
