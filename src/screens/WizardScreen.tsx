import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { CollectedInfo } from '../constants/wizardPrompt';
import { wizardService } from '../services/wizardService';
import { MessageBubble } from '../components/MessageBubble';
import { VoiceInput } from '../components/VoiceInput';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const WizardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({
    childName: '',
    age: 0,
    personality: '',
    interests: [],
    recentFocus: '',
    dreams: '',
    parentExpectations: '',
    desiredCapabilities: [],
    specialNotes: '',
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // 初始化时加载已保存的信息
  useEffect(() => {
    loadSavedInfo();
  }, []);

  // 加载已保存的信息
  const loadSavedInfo = async () => {
    try {
      const savedInfo = await wizardService.loadCollectedInfo();
      if (savedInfo) {
        setCollectedInfo(savedInfo);
        // 添加欢迎信息
        addAiMessage('欢迎回来！我们继续为孩子创建个性化的 AI 伙伴吧。');
      } else {
        // 第一次进入，发送欢迎信息
        addAiMessage('你好！我是小伴童配置向导。很高兴帮助你为孩子创建一个个性化的 AI 伙伴。首先，能告诉我孩子的名字吗？');
      }
    } catch (error) {
      console.error('加载已保存信息失败:', error);
      addAiMessage('你好！我是小伴童配置向导。很高兴帮助你为孩子创建一个个性化的 AI 伙伴。首先，能告诉我孩子的名字吗？');
    }
  };

  // 添加消息到列表
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // 添加 AI 消息
  const addAiMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
    };
    addMessage(newMessage);
  };

  // 添加用户消息
  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(newMessage);
  };

  // 处理输入发送
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    addUserMessage(userText);
    setIsLoading(true);

    try {
      // 发送用户消息到 AI（增加重试机制）
      let aiResponse = '';
      let retries = 3;
      
      while (retries > 0) {
        try {
          aiResponse = await aiService.sendMessage(
            userText,
            { 
              chatStyle: 'friendly',
              aiName: '小伴童向导',
              context: { 
                collectedInfo, 
                isWizard: true 
              }
            }
          );
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      addAiMessage(aiResponse);

      // 分析 AI 回复，提取信息
      const extractedInfo = wizardService.extractInfoFromResponse(aiResponse, collectedInfo);
      
      if (Object.keys(extractedInfo).length > 0) {
        const updatedInfo = { ...collectedInfo, ...extractedInfo };
        setCollectedInfo(updatedInfo);
        await wizardService.saveCollectedInfo(updatedInfo);

        // 检查信息是否完整（简化条件：只需名字）
        if (updatedInfo.childName && updatedInfo.childName.length > 0) {
          setIsLoading(false);
          completeWizard(updatedInfo);
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 不显示错误消息，显示鼓励的话
      addAiMessage('让我再想想...你可以问我任何问题哦！😊');
    } finally {
      setIsLoading(false);
    }
  };

  // 完成向导
  const completeWizard = async (info: CollectedInfo) => {
    try {
      setIsLoading(true);
      
      // 生成三个配置文件
      await generateConfigFiles(info);
      
      await wizardService.clearTemporaryData();
      setIsComplete(true);
      
      // 显示完成消息（添加到对话中）
      addAiMessage(`🎉 配置已完成！
- ✅ system.md 已生成
- ✅ user.md 已生成  
- ✅ identity.md 已生成

现在可以开始和小伴童聊天啦！🚀`);
      
      // 3 秒后导航到主界面
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Chat' as never }],
        });
      }, 3000);
      
    } catch (error) {
      console.error('完成向导失败:', error);
      Alert.alert('保存配置失败', '无法保存角色配置，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 生成三个配置文件 + 结构化数据
  const generateConfigFiles = async (info: CollectedInfo) => {
    try {
      // system.md
      const systemMd = `# system.md - 系统配置

## 核心规则
1. **对话格式**: 始终使用 Markdown 格式输出
2. **语言风格**: 简单易懂，适合${info.childAge || 6}岁儿童
3. **互动方式**: 每次只问一个问题，耐心等待回答
4. **安全约束**: 不问隐私信息（地址、学校、电话等）

## 输出要求
- 使用 Markdown 格式
- 适当使用表情符号
- 段落清晰，每段不超过 3 句
- 重要内容用**加粗**标记
`;

      // user.md
      const userMd = `# user.md - 关于${info.childName}

## 基本信息
- **名字**: ${info.childName}
- **年龄**: ${info.childAge || '未知'}岁
- **性格**: ${info.personality || '活泼可爱'}

## 兴趣爱好
${info.interests?.join('、') || '各种有趣的事物'}
`;

      // identity.md
      const identityMd = `# identity.md - AI 身份定义

## 我是谁
- **名字**: 小伴童
- **角色**: ${info.childName}的 AI 好朋友
- **风格**: 温柔姐姐

## 我的特点
- 像温柔的大姐姐
- 说话有趣易懂
- 总是鼓励和支持

## 我的能力
- 🗣️ 聊天陪伴
- 📚 讲故事
- 🔬 科普知识

## 我的使命
陪伴${info.childName}快乐成长，让每一天都充满好奇和惊喜！
`;

      // 保存到 AsyncStorage（Markdown 文件内容）
      await AsyncStorage.setItem('@kid_companion_system', systemMd);
      await AsyncStorage.setItem('@kid_companion_user', userMd);
      await AsyncStorage.setItem('@kid_companion_identity', identityMd);
      
      // 保存结构化数据（方便代码读取）
      const configData = {
        childName: info.childName,
        childAge: info.childAge || 6,
        personality: info.personality || '活泼可爱',
        interests: info.interests || [],
        aiName: '小伴童',
        aiStyle: '温柔姐姐',
        version: 'v3.6',
        createdAt: Date.now(),
      };
      await AsyncStorage.setItem('@kid_companion_config_data', JSON.stringify(configData));
      
      console.log('三文件配置 + 结构化数据已生成');
    } catch (error) {
      console.error('生成配置文件失败:', error);
    }
  };

  // 渲染消息项
  const renderMessageItem = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI 伙伴配置向导</Text>
          <Text style={styles.subtitle}>为孩子创建个性化的 AI 伙伴</Text>
        </View>

        <View style={styles.messagesContainer}>
          <FlatList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
          />
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingText}>正在思考...</Text>
            </View>
          )}
        </View>

        {!isComplete && (
          <>
            <VoiceInput
              onSpeechRecognized={(text) => {
                setInputText(text);
                handleSend();
              }}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="输入你的回答..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                editable={!isLoading}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={isLoading || !inputText.trim()}
              >
                <Feather 
                  name="send" 
                  size={20} 
                  color={isLoading || !inputText.trim() ? '#9CA3AF' : '#FFFFFF'} 
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    fontSize: 14,
    color: '#1F2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});

export default WizardScreen;
