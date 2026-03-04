import { useAppConfig } from '../store/useAppConfig';
import { OpenAIClient } from '../lib/openai-client';

// 配置字段类型
type ConfigField = 'childName' | 'childAge' | 'interests' | 'aiName' | 'aiStyle';

interface VoiceConfigResult {
  field: ConfigField;
  value: string | number | string[];
  confidence: number;
  rawText: string;
}

interface WizardStep {
  step: number;
  title: string;
  description: string;
  targetField: ConfigField;
}

// 向导步骤定义
export const WIZARD_STEPS: WizardStep[] = [
  {
    step: 1,
    title: '小朋友的名字',
    description: '告诉我小朋友叫什么名字？',
    targetField: 'childName',
  },
  {
    step: 2,
    title: '小朋友的年龄',
    description: '小朋友今年几岁了？',
    targetField: 'childAge',
  },
  {
    step: 3,
    title: '小朋友的兴趣',
    description: '小朋友喜欢什么？（比如画画、唱歌、踢球）',
    targetField: 'interests',
  },
];

/**
 * 语音引导配置服务
 * 处理语音输入，提取配置信息
 */
class VoiceWizardService {
  /**
   * 处理语音文本，提取配置
   */
  async processVoiceForConfig(
    transcript: string,
    currentStep: WizardStep
  ): Promise<VoiceConfigResult> {
    const config = useAppConfig.getState();
    const { apiKey, apiUrl, models } = config;
    
    if (!apiKey) {
      throw new Error('请先配置 API Key');
    }

    const client = new OpenAIClient({
      apiKey,
      baseURL: apiUrl || 'https://api.siliconflow.cn/v1',
      model: models?.chat || 'deepseek-ai/DeepSeek-V3',
    });

    const prompt = this.buildExtractionPrompt(transcript, currentStep);

    try {
      const result = await client.chat({
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        maxTokens: 1024,
      });

      const text = result.text;
      return this.parseExtractionResult(text, currentStep, transcript);
    } catch (error) {
      console.error('Voice config extraction error:', error);
      throw error;
    }
  }

  /**
   * 构建提取配置的提示词
   */
  private buildExtractionPrompt(transcript: string, step: WizardStep): string {
    return `你是一个儿童应用配置助手。请从用户的语音输入中提取配置信息。

当前配置项：${step.title}
目标字段：${step.targetField}

用户说："${transcript}"

请分析用户输入，提取相关信息。

规则：
1. 如果是姓名，提取名字（2-4个汉字或英文名）
2. 如果是年龄，提取数字（1-15岁）
3. 如果是兴趣，提取1-5个关键词

请直接返回 JSON 格式：
{"value": "提取的值", "confidence": 0.9}

confidence 表示置信度（0-1），如果用户输入不明确，confidence 应较低。`;
  }

  /**
   * 解析提取结果
   */
  private parseExtractionResult(
    text: string,
    step: WizardStep,
    rawText: string
  ): VoiceConfigResult {
    try {
      // 尝试解析 JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        let value: string | number | string[] = parsed.value;
        
        // 根据字段类型处理
        if (step.targetField === 'childAge') {
          value = parseInt(String(value), 10) || 6;
        } else if (step.targetField === 'interests') {
          if (typeof value === 'string') {
            value = value.split(/[,、，]/).map(s => s.trim()).filter(Boolean);
          }
        }

        return {
          field: step.targetField,
          value,
          confidence: parsed.confidence || 0.8,
          rawText,
        };
      }
    } catch (error) {
      console.error('Parse extraction result error:', error);
    }

    // 默认返回原始文本
    return {
      field: step.targetField,
      value: rawText,
      confidence: 0.5,
      rawText,
    };
  }

  /**
   * 获取下一个步骤
   */
  getNextStep(currentStep: number): WizardStep | null {
    if (currentStep >= WIZARD_STEPS.length) {
      return null;
    }
    return WIZARD_STEPS[currentStep];
  }

  /**
   * 检查是否完成所有步骤
   */
  isComplete(currentStep: number): boolean {
    return currentStep >= WIZARD_STEPS.length;
  }
}

export const voiceWizardService = new VoiceWizardService();
export default voiceWizardService;
