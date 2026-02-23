/**
 * 配置管理工具
 * 
 * 提供统一的配置读写接口，支持：
 * 1. 结构化数据读写（JSON）
 * 2. Markdown 文件内容读写
 * 3. AI 可通过调用这些方法管理配置
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConfigData {
  childName: string;
  childAge: number;
  personality: string;
  interests: string[];
  aiName: string;
  aiStyle: string;
  version: string;
  createdAt: number;
}

/**
 * 读取结构化配置数据
 */
export const getConfigData = async (): Promise<ConfigData | null> => {
  try {
    const json = await AsyncStorage.getItem('@kid_companion_config_data');
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('读取配置数据失败:', error);
    return null;
  }
};

/**
 * 更新结构化配置数据
 */
export const updateConfigData = async (data: Partial<ConfigData>): Promise<boolean> => {
  try {
    const currentData = await getConfigData();
    const newData = { ...currentData, ...data } as ConfigData;
    await AsyncStorage.setItem('@kid_companion_config_data', JSON.stringify(newData));
    return true;
  } catch (error) {
    console.error('更新配置数据失败:', error);
    return false;
  }
};

/**
 * 读取 Markdown 文件内容
 */
export const getConfigFile = async (file: 'system' | 'user' | 'identity'): Promise<string | null> => {
  try {
    const key = `@kid_companion_${file}`;
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`读取${file}.md 失败:`, error);
    return null;
  }
};

/**
 * 更新 Markdown 文件内容
 */
export const updateConfigFile = async (
  file: 'system' | 'user' | 'identity',
  content: string
): Promise<boolean> => {
  try {
    const key = `@kid_companion_${file}`;
    await AsyncStorage.setItem(key, content);
    return true;
  } catch (error) {
    console.error(`更新${file}.md 失败:`, error);
    return false;
  }
};

/**
 * 获取孩子名字（快捷方法）
 */
export const getChildName = async (): Promise<string> => {
  const data = await getConfigData();
  return data?.childName || '小朋友';
};

/**
 * 获取 AI 名字（快捷方法）
 */
export const getAiName = async (): Promise<string> => {
  const data = await getConfigData();
  return data?.aiName || '小伴童';
};

/**
 * 检查配置是否完整
 */
export const isConfigComplete = async (): Promise<boolean> => {
  try {
    const [system, user, identity, configData] = await Promise.all([
      AsyncStorage.getItem('@kid_companion_system'),
      AsyncStorage.getItem('@kid_companion_user'),
      AsyncStorage.getItem('@kid_companion_identity'),
      AsyncStorage.getItem('@kid_companion_config_data'),
    ]);
    
    return !!(system && user && identity && configData);
  } catch (error) {
    console.error('检查配置失败:', error);
    return false;
  }
};

/**
 * 清除所有配置
 */
export const clearConfig = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      '@kid_companion_system',
      '@kid_companion_user',
      '@kid_companion_identity',
      '@kid_companion_config_data',
    ]);
    return true;
  } catch (error) {
    console.error('清除配置失败:', error);
    return false;
  }
};
