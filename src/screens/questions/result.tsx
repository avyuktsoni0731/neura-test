import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useQuizStore } from '../../store/quizStore';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function TestResult() {
  const { t } = useTranslation();
  const answers = useQuizStore(s => s.answers);
  const resetQuiz = useQuizStore(s => s.resetQuiz);
  const navigation: any = useNavigation();

  const wordList = answers.wordList || [];

  const correctReco = (answers.Question2 || []).filter((w: string) =>
    wordList.includes(w),
  ).length;

  const correctDigit = answers.Question3 === '3185' ? 1 : 0;

  const namingCorrect =
    answers.Question4?.toLowerCase().trim() === 'lion' ? 1 : 0;

  const spatialCorrect = answers.Question5?.correctCount || 0;

  const totalScore =
    correctReco + correctDigit + namingCorrect + spatialCorrect;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('result.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.section}>{t('result.dateOrientation')}</Text>
        <Text style={styles.ans}>
          {t('result.entered')}: {answers.Question1?.entered || '-'}
          {'\n'}
          {t('result.correct')}:{' '}
          {answers.Question1?.isCorrect ? t('result.yes') : t('result.no')}
        </Text>

        <Text style={styles.section}>{t('result.wordRecall')}</Text>
        <Text style={styles.ans}>
          {t('result.correct')}: {correctReco} / 4
        </Text>

        <Text style={styles.section}>{t('result.backwardDigitSpan')}</Text>
        <Text style={styles.ans}>
          {correctDigit === 1 ? t('result.correct') : t('result.incorrect')}
        </Text>

        <Text style={styles.section}>{t('result.naming')}</Text>
        <Text style={styles.ans}>
          {namingCorrect === 1 ? t('result.correct') : t('result.incorrect')}
        </Text>

        <Text style={styles.section}>{t('result.spatialMemory')}</Text>
        <Text style={styles.ans}>
          {spatialCorrect} / 4 {t('result.correctPositions')}
        </Text>

        <View style={styles.totalBox}>
          <Text style={styles.totalScore}>
            {t('result.totalScore')}: {totalScore} / 10
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          resetQuiz();
          navigation.navigate('MainTabs', { screen: 'Home' });
        }}
      >
        <Text style={styles.buttonText}>{t('result.returnToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#f9fafb' },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  section: { fontSize: 18, fontWeight: '700', marginTop: 20 },
  ans: { fontSize: 16, marginTop: 6 },
  totalBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
  },
  totalScore: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#0369a1',
  },
  button: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

/*
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useQuizStore } from "../../store/quizStore";
import { useNavigation } from "@react-navigation/native";


export default function TestResult() {
  const answers = useQuizStore((s) => s.answers);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const navigation: any = useNavigation();

  const wordList = (answers.wordList as string[]) || ["Face", "Velvet", "Church", "Daisy", "Red"];
  let score = 0;

  if (answers.Question1 && (answers.Question1 as string).trim().length > 0) score += 1;

  if (answers.Question2) {
    const typed = (Array.isArray(answers.Question2) ? answers.Question2.join(" ") : answers.Question2 as string).toLowerCase();
    const matched = wordList.reduce((acc, w) => acc + (typed.includes(w.toLowerCase()) ? 1 : 0), 0);
    if (matched >= 3) score += 1;
  }


  if (answers.Question3 && (answers.Question3 as string).replace(/\D/g, "") === "9247") score += 1;

  if (answers.Question4 && (answers.Question4 as string).toLowerCase().includes("lion")) score += 1;

  if (Array.isArray(answers.Question5) && (answers.Question5 as string[]).length > 0) score += 1;


  const interpretation =
    score >= 4
      ? "Low concern on this quick screen. Recommend routine monitoring."
      : score === 3
      ? "Mild concerns — consider a follow-up with detailed cognitive testing."
      : "Elevated concern — recommend referral to clinician for comprehensive evaluation.";

      return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Screening Report</Text>
      <Text style={styles.subtitle}>Quick cognitive screen (demo). Score: {score} / 5</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Answers</Text>
        {Object.entries(answers).map(([k, v]) => (
          <View key={k} style={styles.answerRow}>
            <Text style={styles.qKey}>{k}:</Text>
            <Text style={styles.qVal}>{Array.isArray(v) ? v.join(", ") : String(v ?? "—")}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interpretation (demo)</Text>
        <Text style={styles.interpretation}>{interpretation}</Text>
      </View>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          resetQuiz();
        }}>
        <Text style={styles.resetText}>Reset Answers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          navigation.navigate("Home" as never);
        }}>
          <Text style={styles.resetText}>Exit</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { padding: 22, backgroundColor: "#f8fafc", flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  subtitle: { textAlign: "center", color: "#374151", marginBottom: 18 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  answerRow: { flexDirection: "row", marginBottom: 6 },
  qKey: { width: 110, color: "#374151", fontWeight: "700" },
  qVal: { flex: 1, color: "#111827" },
  interpretation: { fontSize: 16, color: "#111827" },
  resetButton: { marginTop: 18, alignItems: "center", padding: 12, borderRadius: 10, backgroundColor: "#ef4444" },
  exitButton: { marginTop: 18, alignItems: "center", padding: 12, borderRadius: 10, backgroundColor: "yellow"},
  resetText: { color: "#fff", fontWeight: "700" },
});
*/
