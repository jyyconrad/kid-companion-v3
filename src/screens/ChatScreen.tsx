import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { VoiceInput } from '../components/VoiceInput';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { aiService, Message as AIMessage } from '../services/aiService';
import { useAppConfig } from '../store/useAppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Skill, getSkillById, detectSkill, activateSkill, deactivateSkill } from '../skills';
import { detectIntent } from '../utils/intentDetection';

export const ChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const flatListRef = useRef<FlatList<AIMessage>>(null);
  const config = useAppConfig();
  const currentAIResponse = useRef<string>('');

  // 启动时加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  // 首次进入时触发欢迎消息
  useEffect(() => {
    if (isConfigLoaded && !hasWelcomed && messages.length === 0) {
      triggerWelcomeMessage();
      setHasWelcomed(true);
    }
  }, [isConfigLoaded, hasWelcomed, messages.length]);

  const loadConfig = async () => {
    await config.loadConfig();
    setIsConfigLoaded(true);
  };

  // 触发欢迎消息
  const triggerWelcomeMessage = async () => {
    try {
      // 检查是否是首次访问
      const lastVisit = await AsyncStorage.getItem('@last_visit');
      const isFirstVisit = !lastVisit;
      
      // 获取孩子名字（从结构化数据读取，不解析 Markdown）
      const configDataJson = await AsyncStorage.getItem('@kid_companion_config_data');
      const configData = configDataJson ? JSON.parse(configDataJson) : null;
      const childName = configData?.childName || '小朋友';
      const aiName = configData?.aiName || '小伴童';
      
      // 构建欢迎提示词
      const welcomePrompt = `你是${aiName}，正在和${childName}打招呼。
${isFirstVisit ? '这是第一次见面，要说很高兴认识你' : '这是再次见面，要说又见面啦'}。
请说一句友好的欢迎话（简短、有趣、使用表情符号），并询问今天想做什么（聊天、听故事、学科普）。
要求：不超过 50 字，亲切友好。`;

      const response = await aiService.sendMessage(welcomePrompt, { context: { isWelcome: true } });
      
      // 显示欢迎消息
      const welcomeMessage: AIMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
      
      // 自动播放语音
      if (autoPlayEnabled) {
        await Speech.speak(response, {
          language: 'zh-CN',
          pitch: 1.0,
          rate: 0.9,
        });
      }
      
      // 记录访问时间
      await AsyncStorage.setItem('@last_visit', Date.now().toString());
    } catch (error) {
      console.error('欢迎消息失败:', error);
    }
  };

  // 消息变化时滚动到底部
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // 错误提示
  useEffect(() => {
    if (error) {
      Alert.alert('聊天错误', error);
      setError(null);
    }
  }, [error]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (!isConfigLoaded) {
      Alert.alert('提示', '正在加载配置，请稍后...');
      return;
    }

    if (!config.apiKey) {
      Alert.alert('提示', '请先在"我的"页面配置 API');
      return;
    }

    // 检测意图并切换 Skill
    const intent = detectIntent(text);
    if (intent.type !== (activeSkill?.id || 'chat')) {
      // 退出当前 Skill
      if (activeSkill) {
        deactivateSkill(activeSkill);
      }
      // 激活新 Skill
      const newSkill = getSkillById(intent.type);
      if (newSkill && newSkill.id !== 'chat') {
        setActiveSkill(newSkill);
        activateSkill(newSkill);
        
        // 显示 Skill 切换提示
        const switchMessage: AIMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: `🎯 已切换到 **${newSkill.name}** 模式！${newSkill.id === 'story' ? ' 想听什么故事呢？' : newSkill.id === 'science' ? ' 有什么问题想问吗？' : ''}`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, switchMessage]);
      } else {
        setActiveSkill(null);
      }
    }

    const userMessage: AIMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    currentAIResponse.current = '';

    // 创建空的 AI 消息用于流式更新
    const aiMessageId = generateMessageId();
    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      // 调用 AI 服务（流式输出）
      const response = await aiService.sendMessage(text, undefined, (chunk: string) => {
        // 流式更新 AI 消息内容
        currentAIResponse.current += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: currentAIResponse.current }
              : msg
          )
        );
      });

      // 自动语音播放
      if (autoPlayEnabled && response) {
        await Speech.speak(response, {
          language: 'zh-CN',
          pitch: 1.0,
          rate: 0.9,
        });
      }
    } catch (err) {
      console.error('聊天请求失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`聊天请求失败：${errorMessage}`);
      
      // 移除空消息
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: AIMessage }) => {
    const message = {
      id: item.id,
      type: (item.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
      content: item.content,
      timestamp: new Date(item.timestamp),
    };

    return <MessageBubble message={message} />;
  };

  const renderListHeader = () => {
    if (!isConfigLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={styles.loadingText}>正在加载配置...</Text>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>开始聊天吧！👋</Text>
          <Text style={styles.emptySubtext}>
            我是{config.persona.aiName}，你的 AI 好朋友
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skill 状态栏 */}
      {activeSkill && (
        <View style={styles.skillBar}>
          <View style={styles.skillBarContent}>
            <Ionicons name={activeSkill.icon as any} size={18} color="#4A90E2" />
            <Text style={styles.skillBarText}>{activeSkill.name}模式</Text>
          </View>
          <TouchableOpacity onPress={() => {
            if (activeSkill) {
              deactivateSkill(activeSkill);
              setActiveSkill(null);
            }
          }}>
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputContainer}>
        <VoiceInput
          onSpeechRecognized={(text) => {
            handleSendMessage(text);
          }}
        />
        <MessageInput
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skillBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0F7FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  skillBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  listContent: {
    paddingBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    padding: 64,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
  },
});
