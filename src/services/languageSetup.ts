// 语言配置初始化服务
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppConfig } from '../store/useAppConfig';

const LANGUAGE_CONFIG_KEY = '@kid_companion_language';

/**
 * 初始化语言配置
 * 设置默认语言为中文，并提供切换语言的功能
 */
export const initializeLanguageConfig = async (): Promise<void> => {
  try {
    // 检查是否已有语言配置
    const existingLanguage = await AsyncStorage.getItem(LANGUAGE_CONFIG_KEY);

    if (!existingLanguage) {
      // 如果没有现有配置，则设置默认语言为中文
      await AsyncStorage.setItem(LANGUAGE_CONFIG_KEY, 'zh-CN');

      // 同时更新应用配置
      useAppConfig.getState().updateConfig({ language: 'zh-CN' });
      console.log('默认语言已设置为中文 (zh-CN)');
    } else {
      // 如果已有配置，则同步到应用状态
      useAppConfig.getState().updateConfig({ language: existingLanguage });
      console.log(`语言配置已加载: ${existingLanguage}`);
    }
  } catch (error) {
    console.error('初始化语言配置失败:', error);
    // 发生错误时仍设置默认中文
    useAppConfig.getState().updateConfig({ language: 'zh-CN' });
  }
};

/**
 * 切换应用语言
 */
export const changeLanguage = async (newLanguage: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_CONFIG_KEY, newLanguage);
    useAppConfig.getState().updateConfig({ language: newLanguage });
    console.log(`语言已更改为: ${newLanguage}`);
  } catch (error) {
    console.error('更改语言配置失败:', error);
    throw error;
  }
};

/**
 * 获取当前应用语言
 */
export const getCurrentLanguage = async (): Promise<string> => {
  try {
    const currentLanguage = await AsyncStorage.getItem(LANGUAGE_CONFIG_KEY);
    return currentLanguage || 'zh-CN'; // 默认返回中文
  } catch (error) {
    console.error('获取语言配置失败:', error);
    return 'zh-CN'; // 错误时返回默认中文
  }
};