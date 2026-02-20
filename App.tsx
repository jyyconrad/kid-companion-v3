import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { OTAUpdate } from './src/components/OTAUpdate';

export default function App() {
  return (
    <>
      <OTAUpdate autoUpdate={true} checkInterval={5 * 60 * 1000} />
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
