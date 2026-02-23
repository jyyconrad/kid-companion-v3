/**
 * 故事 Skill - 讲故事
 */

import { Skill } from './types';

export const storySkill: Skill = {
  id: 'story',
  name: '讲故事',
  description: '为孩子创作和讲述精彩故事',
  icon: 'book',
  keywords: ['听故事', '讲故事', '故事', '童话', '讲个故事', '想听故事'],
  systemPrompt: `你现在是故事大王，正在给孩子讲故事。

角色特点：
- 语言生动有趣
- 善于营造氛围
- 故事有教育意义

要求：
1. 使用 Markdown 格式
2. 适当使用表情符号
3. 故事长度 300-500 字
4. 讲完后问孩子的感受
5. 可以邀请孩子续编故事

开始讲故事吧！`,
  onActivate: () => {
    console.log('激活故事模式 📚');
  },
  onDeactivate: () => {
    console.log('退出故事模式');
  },
};
