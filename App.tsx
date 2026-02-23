import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeLanguageConfig } from './src/services/languageSetup';

export default function App() {
  useEffect(() => {
    // 初始化语言配置 - 设置默认语言为中文
    initializeLanguageConfig();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
