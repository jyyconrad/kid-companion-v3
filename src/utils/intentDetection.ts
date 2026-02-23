/**
 * 意图识别工具
 */

import { detectSkill as detectSkillFromSkills } from '../skills';

export interface Intent {
  type: 'chat' | 'story' | 'science';
  confidence: number;
  originalText: string;
  matchedKeywords?: string[];
}

/**
 * 简单关键词匹配检测意图
 */
export const detectIntent = (text: string): Intent => {
  const skillId = detectSkillFromSkills(text);
  
  // 获取匹配的关键词
  const lowerText = text.toLowerCase();
  const matchedKeywords: string[] = [];
  
  if (skillId === 'story') {
    const storyKeywords = ['听故事', '讲故事', '故事', '童话', '讲个故事', '想听故事'];
    storyKeywords.forEach(k => {
      if (lowerText.includes(k.toLowerCase())) matchedKeywords.push(k);
    });
  } else if (skillId === 'science') {
    const scienceKeywords = ['为什么', '科普', '知识', '科学', '怎么回事', '是什么', '怎么来的'];
    scienceKeywords.forEach(k => {
      if (lowerText.includes(k.toLowerCase())) matchedKeywords.push(k);
    });
  }
  
  return {
    type: skillId as Intent['type'],
    confidence: matchedKeywords.length > 0 ? 0.9 : 0.7,
    originalText: text,
    matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : undefined,
  };
};

/**
 * 检测是否应该切换 Skill
 * 返回新的 skill id（如果不需要切换则返回 null）
 */
export const shouldSwitchSkill = (
  text: string,
  currentSkillId: string | null
): string | null => {
  const detectedSkill = detectSkillFromSkills(text);
  
  // 如果检测到不同的 Skill，则切换
  if (detectedSkill !== currentSkillId) {
    console.log(`应该切换 Skill: ${currentSkillId} -> ${detectedSkill}`);
    return detectedSkill;
  }
  
  return null;
};
