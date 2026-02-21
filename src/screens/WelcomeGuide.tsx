import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppConfig } from '../store/useAppConfig';
import { GuideStep1 } from './GuideStep1';
import { GuideStep2 } from './GuideStep2';
import { GuideStep3 } from './GuideStep3';
import { GuideComplete } from './GuideComplete';

export const WelcomeGuide: React.FC = () => {
  const config = useAppConfig();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  if (config.persona.isInitialized && config.apiKey) {
    return null;
  }

  switch (step) {
    case 1:
      return <GuideStep1 onNext={handleNext} />;
    case 2:
      return <GuideStep2 onNext={handleNext} onBack={handleBack} />;
    case 3:
      return <GuideStep3 onNext={handleNext} onBack={handleBack} />;
    case 4:
      return <GuideComplete />;
    default:
      return <GuideStep1 onNext={handleNext} />;
  }
};
