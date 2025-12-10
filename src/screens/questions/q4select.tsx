// src/screens/questions/q4select.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question4Select">;

export default function Question4Select({ navigation }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  const handleNext = () => {
    setQuizAnswer("Question4", name.trim());
    navigation.navigate("Question5");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('questions.question')} 4 {t('questions.of')} 5
      </Text>
      
      <Text style={styles.question}>
        {t('questions.pictureQuestion') || 'What was in the picture you saw?'}
      </Text>

      <Text style={styles.instruction}>
        {t('questions.pictureInstruction') || 'Enter the name of the animal or object:'}
      </Text>

      <TextInput
        placeholder={t('questions.picturePlaceholder') || 'Type your answer...'}
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
        autoFocus
      />

      <TouchableOpacity 
        style={[styles.button, !name.trim() && { opacity: 0.4 }]} 
        onPress={handleNext}
        disabled={!name.trim()}
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
    backgroundColor: "#fffaf0", 
    justifyContent: "center" 
  },
  progress: { 
    textAlign: "center", 
    color: "#6b7280", 
    marginBottom: 12 
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 26,
  },
  button: { 
    backgroundColor: "#2563eb", 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
});