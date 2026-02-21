import { create } from 'zustand';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { AppConfig, defaultConfig } from '../types/config';
import { wizardService } from '../services/wizardService';

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
      // 先加载旧配置
      const configJson = await AsyncStorage.getItem(APP_CONFIG_KEY);
      if (configJson) {
        const config = JSON.parse(configJson) as AppConfig;
        
        // 检查是否有新的角色配置
        const characterConfig = await wizardService.loadCharacterConfig();
        if (characterConfig) {
          // 合并新配置到旧配置中
          const mergedConfig = {
            ...config,
            persona: {
              ...config.persona,
              aiName: characterConfig.aiName,
              chatStyle: characterConfig.chatStyle,
              interests: characterConfig.interests,
              childAge: characterConfig.childAge,
              isInitialized: true,
            },
          };
          
          set(mergedConfig);
          await AsyncStorage.setItem(APP_CONFIG_KEY, JSON.stringify(mergedConfig));
        } else {
          set(config);
        }
      } else {
        // 检查是否有新配置
        const characterConfig = await wizardService.loadCharacterConfig();
        if (characterConfig) {
          const config = {
            ...defaultConfig,
            persona: {
              ...defaultConfig.persona,
              aiName: characterConfig.aiName,
              chatStyle: characterConfig.chatStyle,
              interests: characterConfig.interests,
              childAge: characterConfig.childAge,
              isInitialized: true,
            },
          };
          set(config);
          await AsyncStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config));
        } else {
          set(defaultConfig);
        }
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
