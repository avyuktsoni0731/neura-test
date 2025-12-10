import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import { useQuizStore } from "../../store/quizStore";

type Props = NativeStackScreenProps<RootStackParamList, "Question3Select">;

const CORRECT_SEQUENCE = ["Red", "Blue", "Green", "Yellow"];
const DISTRACTORS = ["Purple", "Orange", "Pink", "Brown"];

export default function Question3Select({ navigation }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  
  const shuffled = useMemo(
    () => [...CORRECT_SEQUENCE, ...DISTRACTORS].sort(() => Math.random() - 0.5),
    []
  );

  const setQuizAnswer = useQuizStore((s) => s.setAnswer);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const next = () => {
    setQuizAnswer("Question3", JSON.stringify(selected));
    navigation.navigate("Question4");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('questions.question')} 3 {t('questions.of')} 5
      </Text>
      <Text style={styles.question}>
        {t('questions.selectItems') || 'Select the items you saw:'}
      </Text>

      <View style={styles.choiceBox}>
        {shuffled.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.choiceItem, selected.includes(item) && styles.selected]}
            onPress={() => toggle(item)}
          >
            <Text style={[styles.choiceText, selected.includes(item) && styles.selText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, selected.length !== 4 && { opacity: 0.4 }]}
        disabled={selected.length !== 4}
        onPress={next}
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
    justifyContent: "center", 
    backgroundColor: "#fff" 
  },
  progress: { 
    textAlign: "center", 
    marginBottom: 12, 
    color: "#666" 
  },
  question: { 
    fontSize: 20, 
    fontWeight: "700", 
    textAlign: "center", 
    marginBottom: 20 
  },
  choiceBox: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    gap: 12, 
    marginBottom: 20 
  },
  choiceItem: { 
    padding: 12, 
    backgroundColor: "#eee", 
    borderRadius: 12 
  },
  selected: { 
    backgroundColor: "#2563eb" 
  },
  choiceText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111" 
  },
  selText: { 
    color: "#fff" 
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },
});