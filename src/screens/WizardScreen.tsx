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
import { Feather } from '@expo/vector-icons';
import { CollectedInfo } from '../constants/wizardPrompt';
import { wizardService } from '../services/wizardService';
import { MessageBubble } from '../components/MessageBubble';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const WizardScreen: React.FC = () => {
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
      // 发送用户消息到 AI
      const aiResponse = await aiService.sendMessage(
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

      addAiMessage(aiResponse);

      // 分析 AI 回复，提取信息
      const extractedInfo = wizardService.extractInfoFromResponse(aiResponse, collectedInfo);
      
      if (Object.keys(extractedInfo).length > 0) {
        const updatedInfo = { ...collectedInfo, ...extractedInfo };
        setCollectedInfo(updatedInfo);
        await wizardService.saveCollectedInfo(updatedInfo);

        // 检查信息是否完整
        if (wizardService.isInfoComplete(updatedInfo)) {
          setIsLoading(false);
          completeWizard(updatedInfo);
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      addAiMessage('抱歉，我暂时无法回复。请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 完成向导
  const completeWizard = async (info: CollectedInfo) => {
    try {
      setIsLoading(true);
      const config = wizardService.generateCharacterConfig(info);
      await wizardService.saveConfig(config);
      await wizardService.clearTemporaryData();
      
      setIsComplete(true);
      
      Alert.alert(
        '配置完成！',
        'AI 伙伴已成功创建。现在可以开始使用小伴童了！',
        [
          { 
            text: '立即体验', 
            onPress: () => {
              // 这里应该导航到主应用界面
              console.log('配置完成，导航到主界面');
            }
          }
        ]
      );
    } catch (error) {
      console.error('完成向导失败:', error);
      Alert.alert('保存配置失败', '无法保存角色配置，请重试');
    } finally {
      setIsLoading(false);
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
