import { create } from 'zustand';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { AppConfig, defaultConfig } from '../types/config';

type AppConfigStore = AppConfig & {
  // Actions
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  updateConfig: (config: Partial<AppConfig>) => void;
  resetConfig: () => Promise<void>;
};

const APP_CONFIG_KEY = '@kid_companion_config';

export const useAppConfig = create<AppConfigStore>((set, get) => ({
  ...defaultConfig,

  loadConfig: async () => {
    try {
      const configJson = await AsyncStorage.getItem(APP_CONFIG_KEY);
      if (configJson) {
        const config = JSON.parse(configJson) as AppConfig;
        set(config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  },

  saveConfig: async () => {
    try {
      const config = get();
      await AsyncStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },

  updateConfig: (config: Partial<AppConfig>) => {
    set((state) => ({ ...state, ...config }));
  },

  resetConfig: async () => {
    try {
      set(defaultConfig);
      await AsyncStorage.setItem(APP_CONFIG_KEY, JSON.stringify(defaultConfig));
    } catch (error) {
      console.error('Failed to reset config:', error);
    }
  },
}));
