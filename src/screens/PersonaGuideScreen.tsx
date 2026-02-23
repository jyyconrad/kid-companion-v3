import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppConfig } from '../store/useAppConfig';
import { aiService, Message } from '../services/aiService';

interface PersonaGuideScreenProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

type GuideStep = 'intro' | 'name' | 'age' | 'style' | 'interests' | 'generating' | 'complete';

const CHAT_STYLES = [
  { label: '温柔姐姐', value: '温柔姐姐' },
  { label: '耐心哥哥', value: '耐心哥哥' },
  { label: '快乐玩伴', value: '快乐玩伴' },
  { label: '知识渊博', value: '知识渊博' },
  { label: '幽默风趣', value: '幽默风趣' },
  { label: '活泼开朗', value: '活泼开朗' },
];

const INTEREST_SUGGESTIONS = [
  '恐龙', '太空', '动物', '画画', '音乐', '运动',
  '讲故事', '科学', '动画片', '游戏', '自然', '食物',
];

export const PersonaGuideScreen: React.FC<PersonaGuideScreenProps> = ({ onComplete, onCancel }) => {
  const config = useAppConfig();
  const [step, setStep] = useState<GuideStep>('intro');
  const [aiName, setAiName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [chatStyle, setChatStyle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPersona, setGeneratedPersona] = useState<any>(null);

  const handleNext = () => {
    switch (step) {
      case 'intro':
        setStep('name');
        break;
      case 'name':
        setStep('age');
        break;
      case 'age':
        setStep('style');
        break;
      case 'style':
        setStep('interests');
        break;
      case 'interests':
        generatePersona();
        break;
      case 'complete':
        saveAndComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'name':
        setStep('intro');
        break;
      case 'age':
        setStep('name');
        break;
      case 'style':
        setStep('age');
        break;
      case 'interests':
        setStep('style');
        break;
    }
  };

  const generatePersona = async () => {
    setIsGenerating(true);
    setStep('generating');

    try {
      const prompt = `根据以下信息，为AI儿童伙伴生成一个合适的角色配置：

AI名称：${aiName || '小伴童'}
孩子年龄：${childAge || '6岁'}
聊天风格：${chatStyle || '温柔姐姐'}
兴趣领域：${interests.join('、') || '无'}

请生成以下配置（JSON格式）：
{
  "aiName": "AI名称",
  "chatStyle": "聊天风格描述（30-50字）",
  "interests": ["兴趣1", "兴趣2", "兴趣3"],
  "isInitialized": true
}

只返回JSON，不要其他内容。`;

      const response = await aiService.sendMessage(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const persona = JSON.parse(jsonMatch[0]);
        setGeneratedPersona(persona);
        setStep('complete');
      } else {
        throw new Error('AI返回格式错误');
      }
    } catch (error) {
      console.error('Generate persona error:', error);
      Alert.alert('生成失败', '请重试或手动配置');
      setStep('interests');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAndComplete = async () => {
    try {
      const persona = generatedPersona || {
        aiName: aiName || '小伴童',
        chatStyle: chatStyle || '温柔姐姐',
        interests,
        childAge: parseInt(childAge) || 6,
        isInitialized: true,
      };

      config.updateConfig({ persona });
      await config.saveConfig();
      
      Alert.alert('配置成功', 'AI角色已生成', [
       
        
        {
          text: '完成',
          onPress: () => {
            onComplete?.();
          },
        },
      ]);
    } catch (error) {
      console.error('Save persona error:', error);
      Alert.alert('保存失败', '请重试');
    }
  };

  const addInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>欢迎来到小伴童！</Text>
            <Text style={styles.stepDescription}>
              我们将一步步为您的孩子配置一个专属的AI儿童伙伴。
            </Text>
            <View style={styles.stepList}>
              <Text style={styles.stepItem}>✓ 设置AI名称</Text>
              <Text style={styles.stepItem}>✓ 配置孩子年龄</Text>
              <Text style={styles.stepItem}>✓ 选择聊天风格</Text>
              <Text style={styles.stepItem}>✓ 添加兴趣领域</Text>
              <Text style={styles.stepItem}>✓ AI自动生成角色</Text>
            </View>
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>给AI起个名字吧</Text>
            <Text style={styles.stepDescription}>
              比如：小伴童、多多、乐乐、小美等
            </Text>
            <TextInput
              style={styles.input}
              value={aiName}
              onChangeText={setAiName}
              placeholder="输入AI名称"
              placeholderTextColor="#999"
            />
          </View>
        );

      case 'age':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>孩子多大啦？</Text>
            <Text style={styles.stepDescription}>
              输入孩子的年龄（建议3-12岁）
            </Text>
            <TextInput
              style={styles.input}
              value={childAge}
              onChangeText={setChildAge}
              placeholder="输入年龄"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        );

      case 'style':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>希望AI是什么风格？</Text>
            <Text style={styles.stepDescription}>
              选择一个聊天风格，AI会按照这个风格和孩子交流
            </Text>
            <View style={styles.optionList}>
              {CHAT_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.value}
                  style={[
                    styles.optionItem,
                    chatStyle === style.value && styles.optionItemSelected,
                  ]}
                  onPress={() => setChatStyle(style.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      chatStyle === style.value && styles.optionTextSelected,
                    ]}
                  >
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'interests':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>孩子对什么感兴趣？</Text>
            <Text style={styles.stepDescription}>
              添加几个兴趣，AI会围绕这些话题和孩子交流
            </Text>
            
            <View style={styles.interestInputContainer}>
              <TextInput
                style={styles.interestInput}
                value={interestInput}
                onChangeText={setInterestInput}
                placeholder="输入兴趣或选择下方"
                placeholderTextColor="#999"
              />
              {interestInput.trim() && (
                <TouchableOpacity
                  style={styles.addInterestButton}
                  onPress={() => {
                    if (interestInput.trim()) {
                      addInterest(interestInput.trim());
                      setInterestInput('');
                    }
                  }}
                >
                  <Text style={styles.addInterestButtonText}>添加</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.suggestionList}>
              {INTEREST_SUGGESTIONS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.suggestionItem,
                    interests.includes(interest) && styles.suggestionItemSelected,
                  ]}
                  onPress={() => {
                    if (interests.includes(interest)) {
                      removeInterest(interest);
                    } else {
                      addInterest(interest);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      interests.includes(interest) && styles.suggestionTextSelected,
                    ]}
                  >
                    {interest}
                  </Text>
                  {interests.includes(interest) && (
                    <Text style={styles.suggestionRemove}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {interests.length > 0 && (
              <View style={styles.selectedContainer}>
                <Text style={styles.selectedTitle}>已选择：</Text>
                <Text style={styles.selectedText}>
                  {interests.join('、')}
                </Text>
              </View>
            )}
          </View>
        );

      case 'generating':
        return (
          <View style={styles.stepContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.generatingText}>
              AI正在为孩子生成专属角色...
            </Text>
          </View>
        );

      case 'complete':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>✓ 角色生成完成！</Text>
            
            {generatedPersona && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>AI名称：</Text>
                <Text style={styles.resultValue}>{generatedPersona.aiName}</Text>
                
                <Text style={styles.resultLabel}>聊天风格：</Text>
                <Text style={styles.resultValue}>{generatedPersona.chatStyle}</Text>
                
                <Text style={styles.resultLabel}>兴趣领域：</Text>
                <Text style={styles.resultValue}>
                  {generatedPersona.interests?.join('、')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setStep('intro');
                setGeneratedPersona(null);
              }}
            >
              <Text style={styles.retryButtonText}>重新配置</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'intro':
        return true;
      case 'name':
        return aiName.trim().length > 0;
      case 'age':
        return childAge.trim().length > 0 && parseInt(childAge) > 0;
      case 'style':
        return chatStyle.trim().length > 0;
      case 'interests':
        return interests.length >= 1;
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>角色配置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step !== 'generating' && step !== 'complete' && (
          <>
            {step !== 'intro' && (
              <TouchableOpacity
                style={[styles.footerButton, styles.backButton]}
                onPress={handleBack}
              >
                <Text style={styles.footerButtonText}>上一步</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.nextButton,
                !canProceed() && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text
                style={[
                  styles.footerButtonText,
                  !canProceed() && styles.nextButtonTextDisabled,
                ]}
              >
                {step === 'interests' ? '生成角色' : '下一步'}
              </Text>
            </TouchableOpacity>
          </>
        )}
        {step === 'complete' && (
          <TouchableOpacity
            style={[styles.footerButton, styles.completeButton]}
            onPress={saveAndComplete}
          >
            <Text style={styles.footerButtonText}>完成配置</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  stepList: {
    marginTop: 16,
  },
  stepItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionList: {
    gap: 12,
  },
  optionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionItemSelected: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    backgroundColor: '#F0F7FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#4A90E2',
  },
  interestInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  interestInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addInterestButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  addInterestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionItemSelected: {
    backgroundColor: '#F0F7FF',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionTextSelected: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  suggestionRemove: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  selectedContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 8,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  generatingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignSelf: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F5F5F5',
  },
  nextButton: {
    backgroundColor: '#4A90E2',
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  completeButton: {
    backgroundColor: '#4A90E2',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
