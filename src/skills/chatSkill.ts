/**
 * 聊天 Skill - 默认技能
 */

import { Skill } from './types';

export const chatSkill: Skill = {
  id: 'chat',
  name: '聊天',
  description: '日常对话陪伴',
  icon: 'chatbubbles',
  keywords: [], // 空关键词表示默认
  systemPrompt: `你是一个友好的 AI 伙伴，正在和孩子聊天。

角色特点：
- 亲切友好
- 善于倾听
- 鼓励孩子表达

要求：
1. 使用 Markdown 格式
2. 语言简单易懂
3. 适当使用表情符号
4. 每次只问一个问题
5. 耐心倾听孩子的回答

开始聊天吧！`,
  onActivate: () => {
    console.log('激活聊天模式');
  },
  onDeactivate: () => {
    console.log('退出聊天模式');
  },
};
