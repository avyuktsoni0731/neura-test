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
import { useAppStore } from '../../store/appstore.js';

export default function TestResult({ route }: any) {
  const { t } = useTranslation();
  const answers = useQuizStore(s => s.answers);
  const resetQuiz = useQuizStore(s => s.resetQuiz);
  const saveQuizResults = useAppStore(s => s.saveQuizResults);
  const navigation: any = useNavigation();

  const { patient } = route?.params || {};

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text>Error: Patient data not found</Text>
      </View>
    );
  }

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

  const handleReturnHome = async () => {
    // Save quiz results before returning
    await saveQuizResults(patient.id, {
      totalScore,
      maxScore: 10,
      answers,
    });
    resetQuiz();
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleStartMotorTest = async () => {
    console.log('Patient data:', patient); // Debug log

    if (!patient) {
      console.error('Patient is undefined');
      return;
    }

    // Save quiz results before starting motor test
    await saveQuizResults(patient.id, {
      totalScore,
      maxScore: 10,
      answers,
    });
    resetQuiz();
    navigation.navigate('MotorTestInstructions', { patient });
  };

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

      <TouchableOpacity style={styles.button} onPress={handleReturnHome}>
        <Text style={styles.buttonText}>{t('result.returnToHome')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleStartMotorTest}
      >
        <Text style={styles.primaryButtonText}>
          {t('result.startMotorTest')}
        </Text>
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
  primaryButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
