/**
 * Skills 管理器
 */

import { Skill } from './types';
import { chatSkill } from './chatSkill';
import { storySkill } from './storySkill';
import { scienceSkill } from './scienceSkill';

// 所有可用 Skills
export const skills: Skill[] = [chatSkill, storySkill, scienceSkill];

/**
 * 根据 ID 获取 Skill
 */
export const getSkillById = (id: string): Skill | undefined => {
  return skills.find(s => s.id === id);
};

/**
 * 根据关键词检测应该使用哪个 Skill
 * 返回 skill id
 */
export const detectSkill = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  // 遍历所有非聊天 Skill
  for (const skill of skills) {
    if (skill.id === 'chat') continue; // 跳过默认聊天
    
    // 检查是否包含关键词
    if (skill.keywords.some(k => lowerText.includes(k.toLowerCase()))) {
      console.log(`检测到 Skill: ${skill.name} (关键词匹配)`);
      return skill.id;
    }
  }
  
  // 默认聊天
  return 'chat';
};

/**
 * 激活 Skill
 */
export const activateSkill = (skill: Skill): string => {
  console.log(`激活 Skill: ${skill.name}`);
  skill.onActivate?.();
  return skill.systemPrompt;
};

/**
 * 退出 Skill
 */
export const deactivateSkill = (skill: Skill) => {
  console.log(`退出 Skill: ${skill.name}`);
  skill.onDeactivate?.();
};

/**
 * 获取所有可用 Skills
 */
export const getAvailableSkills = (): Skill[] => {
  return skills;
};
