/**
 * AI 文件操作工具
 * 
 * 提供给 AI 调用的文件操作函数，让 AI 可以：
 * 1. 读取配置文件
 * 2. 更新配置文件
 * 3. 获取配置信息
 * 
 * 使用方式：
 * AI 收到用户请求 → 调用相应工具函数 → 更新配置 → 返回结果
 */

import {
  getConfigData,
  updateConfigData,
  getConfigFile,
  updateConfigFile,
  getChildName,
  getAiName,
  isConfigComplete,
} from './configManager';

/**
 * AI 工具：获取配置信息
 * 
 * 示例调用：
 * getFileContent('user') → 返回 user.md 内容
 * getConfigInfo() → 返回结构化配置
 */
export const aiGetConfig = async (options?: {
  file?: 'system' | 'user' | 'identity' | 'all';
  field?: keyof import('./configManager').ConfigData;
}): Promise<any> => {
  try {
    if (options?.field) {
      // 获取特定字段
      const data = await getConfigData();
      return data ? data[options.field] : null;
    }
    
    if (options?.file) {
      if (options.file === 'all') {
        // 获取所有文件
        const [system, user, identity] = await Promise.all([
          getConfigFile('system'),
          getConfigFile('user'),
          getConfigFile('identity'),
        ]);
        return { system, user, identity };
      }
      // 获取特定文件
      return await getConfigFile(options.file);
    }
    
    // 默认返回结构化数据
    return await getConfigData();
  } catch (error) {
    console.error('AI 获取配置失败:', error);
    return { error: '获取配置失败' };
  }
};

/**
 * AI 工具：更新配置信息
 * 
 * 示例调用：
 * updateConfig({ childName: '小明' }) → 更新孩子名字
 * updateFile('user', '新内容') → 更新 user.md
 */
export const aiUpdateConfig = async (
  type: 'data' | 'file',
  target: string,
  content: string | any
): Promise<{ success: boolean; message: string }> => {
  try {
    if (type === 'data') {
      // 更新结构化数据
      const data = { [target]: content };
      const success = await updateConfigData(data);
      return {
        success,
        message: success ? `已更新配置：${target}` : '更新失败',
      };
    } else if (type === 'file') {
      // 更新文件内容
      const file = target as 'system' | 'user' | 'identity';
      const success = await updateConfigFile(file, content);
      return {
        success,
        message: success ? `已更新文件：${target}.md` : '更新失败',
      };
    }
    
    return { success: false, message: '未知的更新类型' };
  } catch (error) {
    console.error('AI 更新配置失败:', error);
    return { success: false, message: '更新失败：' + error };
  }
};

/**
 * AI 工具：检查配置状态
 */
export const aiCheckConfig = async (): Promise<{
  complete: boolean;
  childName: string;
  aiName: string;
}> => {
  const complete = await isConfigComplete();
  const childName = await getChildName();
  const aiName = await getAiName();
  
  return { complete, childName, aiName };
};

/**
 * AI 工具：解析用户指令并更新配置
 * 
 * 示例：
 * 用户说："我改名叫小明了" → 自动更新 childName
 * 用户说："换个温柔的风格" → 自动更新 aiStyle
 */
export const aiParseAndUpdate = async (
  userInput: string
): Promise<{ success: boolean; message: string; updated?: string }> => {
  try {
    const lowerInput = userInput.toLowerCase();
    
    // 检测名字更新
    const nameMatch = userInput.match(/ (?:我叫 | 名字是 | 改名) [. ]*([^\s,.!?]+)/);
    if (nameMatch && nameMatch[1]) {
      const newName = nameMatch[1];
      const success = await updateConfigData({ childName: newName });
      return {
        success,
        message: success ? `好的，我已经记住你叫${newName}了！` : '更新失败',
        updated: 'childName',
      };
    }
    
    // 检测年龄更新
    const ageMatch = userInput.match(/(?:我今年 | 年龄) [. ]*(\d+)[. ]*岁/);
    if (ageMatch && ageMatch[1]) {
      const newAge = parseInt(ageMatch[1]);
      const success = await updateConfigData({ childAge: newAge });
      return {
        success,
        message: success ? `好的，我知道你${newAge}岁了！` : '更新失败',
        updated: 'childAge',
      };
    }
    
    // 检测兴趣更新
    const interestMatch = userInput.match(/(?:喜欢 | 爱好) [. ]*(.+)/);
    if (interestMatch && interestMatch[1]) {
      const interests = interestMatch[1].split(/[, ,]/).map(s => s.trim()).filter(Boolean);
      const success = await updateConfigData({ interests });
      return {
        success,
        message: success ? `好的，我知道你喜欢${interests.join('、')}了！` : '更新失败',
        updated: 'interests',
      };
    }
    
    return { success: false, message: '我没有理解你的意思，可以说得更清楚一点吗？' };
  } catch (error) {
    console.error('AI 解析更新失败:', error);
    return { success: false, message: '更新失败：' + error };
  }
};

// 导出所有工具函数
export const aiFileTools = {
  getConfig: aiGetConfig,
  updateConfig: aiUpdateConfig,
  checkConfig: aiCheckConfig,
  parseAndUpdate: aiParseAndUpdate,
};
