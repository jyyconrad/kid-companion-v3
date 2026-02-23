/**
 * Skill 类型定义
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  systemPrompt: string;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export interface SkillState {
  activeSkillId: string | null;
  availableSkills: Skill[];
}
