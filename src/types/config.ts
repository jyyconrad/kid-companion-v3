// 应用配置类型定义

export interface AppConfig {
  // API配置
  apiUrl: string;
  apiKey: string;

  // 模型配置
  models: {
    chat: string;
    story: string;
    science: string;
  };

  // 功能配置
  features: {
    chat: {
      useSearch: boolean;
      enableVoice: boolean;
      searchCategories: string[];
    };
    science: {
      useSearch: boolean;
      searchCategories: string[];
    };
  };

  // 语言配置
  language: string;

  // AI人设
  persona: {
    aiName: string;
    chatStyle: string;
    interests: string[];
    childAge: number;
    isInitialized: boolean;
  };
}

// 默认配置
export const defaultConfig: AppConfig = {
  apiUrl: 'https://api.siliconflow.cn/v1',
  apiKey: '',
  models: {
    chat: 'deepseek-ai/DeepSeek-V3.2',
    story: 'deepseek-ai/DeepSeek-V3.2',
    science: 'deepseek-ai/DeepSeek-V3.2',
  },
  features: {
    chat: {
      useSearch: false,
      enableVoice: false,
      searchCategories: [],
    },
    science: {
      useSearch: true,
      searchCategories: ['duckduckgo'],
    },
  },
  language: 'zh-CN',
  persona: {
    aiName: '小伴童',
    chatStyle: '温柔姐姐',
    interests: [],
    childAge: 6,
    isInitialized: false,
  },
};
