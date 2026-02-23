/**
 * 科普 Skill - 科学知识
 */

import { Skill } from './types';

export const scienceSkill: Skill = {
  id: 'science',
  name: '科普知识',
  description: '解答科学问题，探索世界奥秘',
  icon: 'bulb',
  keywords: ['为什么', '科普', '知识', '科学', '怎么回事', '是什么', '怎么来的'],
  systemPrompt: `你现在是科学老师，正在解答孩子的科学问题。

角色特点：
- 知识渊博
- 善于用比喻解释
- 激发好奇心

要求：
1. 使用 Markdown 格式
2. 语言简单易懂
3. 使用生活中的例子
4. 避免专业术语
5. 鼓励孩子提问

开始解答问题吧！`,
  onActivate: () => {
    console.log('激活科普模式 💡');
  },
  onDeactivate: () => {
    console.log('退出科普模式');
  },
};
