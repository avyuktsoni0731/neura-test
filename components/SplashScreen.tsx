  import React from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';

export default function SplashScreen() {
  return (
    <View className="bg-[#050816] flex-1 items-center justify-center px-6">
      <Image
        source={require('../assets/logo.png')}
        className="w-40 h-40 mb-4"
        resizeMode="contain"
      />
      <Text className="font-bold text-white mb-1 text-lg">NeuroSense</Text>
      <ActivityIndicator size="large" className="mt-6" />
    </View>
  );
}
