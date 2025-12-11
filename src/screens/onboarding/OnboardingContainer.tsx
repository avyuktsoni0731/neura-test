import React, { useState } from 'react';
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';

interface OnboardingContainerProps {
  onComplete: () => void;
}

export default function OnboardingContainer({ onComplete }: OnboardingContainerProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen === 0) {
      setCurrentScreen(1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (currentScreen === 0) {
    return <OnboardingScreen1 onNext={handleNext} onSkip={handleSkip} />;
  }

  return <OnboardingScreen2 onNext={handleNext} onSkip={handleSkip} />;
}