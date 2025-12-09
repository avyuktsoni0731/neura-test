

import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useQuizStore } from "../../store/quizStore";

export default function TestResult() {
  const answers = useQuizStore((s) => s.answers);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  // Simple demo scoring rules (editable):
  // Q1: any non-empty = 1
  // Q2: immediate recall contains at least 3 original words => 1
  // Q3: digits backwards correct string check => 1
  // Q4: image named "lion" (case-insensitive) => 1
  // Q5: at least one hotspot tapped => 1
  const wordList = (answers.wordList as string[]) || ["Face", "Velvet", "Church", "Daisy", "Red"];
  let score = 0;

  if (answers.Question1 && (answers.Question1 as string).trim().length > 0) score += 1;
// check immediate recall
  if (answers.Question2) {
    const typed = (Array.isArray(answers.Question2) ? answers.Question2.join(" ") : answers.Question2 as string).toLowerCase();
    const matched = wordList.reduce((acc, w) => acc + (typed.includes(w.toLowerCase()) ? 1 : 0), 0);
    if (matched >= 3) score += 1;
  }

  // digits backwards expected for Q3: we used [7,4,2,9] so expected "9247"
  if (answers.Question3 && (answers.Question3 as string).replace(/\D/g, "") === "9247") score += 1;

  if (answers.Question4 && (answers.Question4 as string).toLowerCase().includes("lion")) score += 1;

  if (Array.isArray(answers.Question5) && (answers.Question5 as string[]).length > 0) score += 1;

  // Compose practitioner-friendly message
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
        }}
      >
        <Text style={styles.resetText}>Reset Answers</Text>
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
  resetText: { color: "#fff", fontWeight: "700" },
});