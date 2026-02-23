/**
 * Skills 扩展系统
 * 
 * 支持动态加载新 Skills，无需重新编译应用
 */

import { Skill } from '../skills/types';

/**
 * Skill 配置（从服务器下载）
 */
export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  systemPrompt: string;
  version: string;
  downloadUrl: string;
  checksum: string;
}

/**
 * 从服务器加载 Skills 列表
 */
export const loadSkillsFromServer = async (
  baseUrl: string
): Promise<SkillConfig[]> => {
  try {
    const response = await fetch(`${baseUrl}/api/skills`);
    
    if (!response.ok) {
      throw new Error('获取 Skills 列表失败');
    }
    
    const skills: SkillConfig[] = await response.json();
    return skills;
  } catch (error: any) {
    console.error('加载 Skills 失败:', error);
    return [];
  }
};

/**
 * 下载并安装 Skill
 */
export const downloadAndInstallSkill = async (
  skillConfig: SkillConfig,
  onProgress?: (progress: number) => void
): Promise<Skill | null> => {
  try {
    // 下载 Skill 代码
    const response = await fetch(skillConfig.downloadUrl);
    
    if (!response.ok) {
      throw new Error('下载 Skill 失败');
    }
    
    const skillCode = await response.text();
    
    // 验证 checksum
    // const isValid = await verifyChecksum(skillCode, skillConfig.checksum);
    // if (!isValid) {
    //   throw new Error('Skill 校验失败');
    // }
    
    // 保存 Skill 代码到本地
    // await AsyncStorage.setItem(`@skill_${skillConfig.id}`, skillCode);
    
    // 动态执行 Skill 代码（需要安全沙箱）
    // const skill = await evaluateSkillCode(skillCode);
    
    console.log('Skill 已下载:', skillConfig.name);
    onProgress?.(100);
    
    // 返回 Skill 对象（简化版，实际需要安全执行）
    return {
      id: skillConfig.id,
      name: skillConfig.name,
      description: skillConfig.description,
      icon: skillConfig.icon,
      keywords: skillConfig.keywords,
      systemPrompt: skillConfig.systemPrompt,
    };
  } catch (error: any) {
    console.error('安装 Skill 失败:', error);
    return null;
  }
};

/**
 * 检查 Skill 更新
 */
export const checkSkillUpdates = async (
  currentSkills: Skill[],
  baseUrl: string
): Promise<SkillConfig[]> => {
  try {
    const availableSkills = await loadSkillsFromServer(baseUrl);
    
    const updates = availableSkills.filter(available => {
      const current = currentSkills.find(s => s.id === available.id);
      if (!current) return true;  // 新 Skill
      
      // 版本比较（Skill 没有 version 属性，使用配置中的版本）
      const currentVersion = (current as any).version || '0.0.0';
      return compareVersions(available.version, currentVersion) > 0;
    });
    
    return updates;
  } catch (error) {
    console.error('检查更新失败:', error);
    return [];
  }
};

/**
 * 版本号比较
 */
const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const n1 = parts1[i] || 0;
    const n2 = parts2[i] || 0;
    
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  
  return 0;
};

/**
 * 预定义 Skills 库
 */
export const builtinSkills: SkillConfig[] = [
  {
    id: 'chat',
    name: '聊天',
    description: '日常对话聊天',
    icon: '💬',
    keywords: ['聊天', '说话', '聊聊'],
    systemPrompt: '你是孩子的 AI 好朋友，请用简单有趣的语言聊天。',
    version: '1.0.0',
    downloadUrl: '',
    checksum: '',
  },
  {
    id: 'story',
    name: '讲故事',
    description: '讲童话故事',
    icon: '📚',
    keywords: ['故事', '童话', '讲故事'],
    systemPrompt: '你是故事大王，善于讲生动有趣的童话故事。',
    version: '1.0.0',
    downloadUrl: '',
    checksum: '',
  },
  {
    id: 'science',
    name: '科普',
    description: '科学知识讲解',
    icon: '🔬',
    keywords: ['为什么', '科普', '科学', '知识'],
    systemPrompt: '你是科学老师，用简单易懂的方式解释科学知识。',
    version: '1.0.0',
    downloadUrl: '',
    checksum: '',
  },
  {
    id: 'english',
    name: '英语',
    description: '英语学习',
    icon: '🔤',
    keywords: ['英语', '单词', '英文'],
    systemPrompt: '你是英语老师，教孩子学英语单词和简单对话。',
    version: '1.0.0',
    downloadUrl: '',
    checksum: '',
  },
  {
    id: 'math',
    name: '数学',
    description: '数学启蒙',
    icon: '🔢',
    keywords: ['数学', '算术', '计算', '数字'],
    systemPrompt: '你是数学老师，用游戏的方式教孩子数学。',
    version: '1.0.0',
    downloadUrl: '',
    checksum: '',
  },
  {
    id: 'poem',
    name: '诗词',
    description: '古诗词学习',
    icon: '📜',
    keywords: ['诗', '古诗', '诗词', '背诵'],
    systemPrompt: '你是诗词老师，教孩子学习古诗词。',
    version: '1.0.0',
    downloadUrl: '',
    checksum: '',
  },
];
