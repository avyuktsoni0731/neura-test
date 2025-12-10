
import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Question4">;

export default function Question4({ navigation }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    // Show image for 5 seconds, then navigate to timer
    const timer = setTimeout(() => {
      navigation.navigate("DelayTimer", {
        nextScreen: "Question4Select",
        durationMinutes: 10,
        questionNumber: 4
      });
    }, 5000); // 5 seconds to memorize the image

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {t('questions.question')} 4 {t('questions.of')} 5
      </Text>
      
      <Text style={styles.question}>
        {t('questions.memorizePicture') || 'Memorize this picture:'}
      </Text>

      <View style={styles.imageWrap}>
        <Image 
          source={require("../../../assets/lion.png")} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>

      <Text style={styles.hint}>
        {t('questions.pictureHint') || 'You will be asked about this later'}
      </Text>
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
    marginBottom: 30 
  },
  imageWrap: { 
    alignItems: "center", 
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { 
    width: 250, 
    height: 200, 
    borderRadius: 10 
  },
  hint: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 10,
  },
});
