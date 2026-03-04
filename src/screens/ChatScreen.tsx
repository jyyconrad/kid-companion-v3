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
import { ImageResult } from '../components/MarkdownRenderer';
import { aiService, Message as AIMessage } from '../services/aiService';
import { useAppConfig } from '../store/useAppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Skill, getSkillById, detectSkill, activateSkill, deactivateSkill } from '../skills';
import { detectIntent } from '../utils/intentDetection';
import { StreamSpeechManager } from '../utils/StreamSpeechManager';

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
  
  // 流式输出和语音播放管理
  const currentAIResponse = useRef<string>('');
  const speechManager = useRef<StreamSpeechManager | null>(null);
  const currentMessageId = useRef<string>('');

  // 启动时加载配置
  useEffect(() => {
    loadConfig();
    return () => {
      // 清理语音播放
      speechManager.current?.stop();
    };
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
      const lastVisit = await AsyncStorage.getItem('@last_visit');
      const isFirstVisit = !lastVisit;
      
      const configDataJson = await AsyncStorage.getItem('@kid_companion_config_data');
      const configData = configDataJson ? JSON.parse(configDataJson) : null;
      const childName = configData?.childName || '小朋友';
      const aiName = configData?.aiName || '小伴童';
      
      const welcomePrompt = `你是${aiName}，正在和${childName}打招呼。
${isFirstVisit ? '这是第一次见面，要说很高兴认识你' : '这是再次见面，要说又见面啦'}。
请说一句友好的欢迎话（简短、有趣、使用表情符号），并询问今天想做什么（聊天、听故事、学科普）。
要求：不超过 50 字，亲切友好。`;

      // 初始化流式语音管理器
      speechManager.current = new StreamSpeechManager({
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.9,
        onSentenceStart: (sentence) => {
          console.log('开始播放:', sentence);
        },
        onSentenceEnd: (sentence) => {
          console.log('播放完成:', sentence);
        },
      });

      // 创建消息占位
      const messageId = generateMessageId();
      currentMessageId.current = messageId;
      
      const welcomeMessage: AIMessage = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, welcomeMessage]);

      // 流式调用 + 语音播放
      await aiService.sendMessage(
        welcomePrompt,
        { context: { isWelcome: true } },
        {
          onChunk: (chunk) => {
            currentAIResponse.current += chunk;
            
            // 更新消息内容
            setMessages(prev => prev.map(msg =>
              msg.id === messageId
                ? { ...msg, content: currentAIResponse.current }
                : msg
            ));
            
            // 添加到语音队列
            speechManager.current?.addChunk(chunk);
          },
          onComplete: () => {
            // 标记流式完成，播放剩余内容
            speechManager.current?.markComplete();
          },
          onError: (err) => {
            console.error('欢迎消息失败:', err);
            setError(err.message);
          },
        }
      );
      
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
      Alert.alert('错误', error);
      setError(null);
    }
  }, [error]);

  // 处理发送消息
  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 停止当前语音播放
    speechManager.current?.stop();

    // 添加用户消息
    const userMessage: AIMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    currentAIResponse.current = '';

    try {
      // 检测意图和 Skill
      const intent = detectIntent(text);
      const skillId = detectSkill(text);
      
      // 处理 Skill 切换
      if (skillId !== 'chat' && !activeSkill) {
        const skill = getSkillById(skillId);
        if (skill) {
          setActiveSkill(skill);
          activateSkill(skill);
        }
      } else if (skillId === 'chat' && activeSkill) {
        deactivateSkill(activeSkill);
        setActiveSkill(null);
      }

      // 创建 AI 消息占位
      const messageId = generateMessageId();
      currentMessageId.current = messageId;
      
      const aiMessage: AIMessage = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // 初始化流式语音管理器
      if (autoPlayEnabled) {
        speechManager.current = new StreamSpeechManager({
          language: 'zh-CN',
          pitch: 1.0,
          rate: 0.9,
          onSentenceStart: (sentence) => {
            console.log('🔊 播放:', sentence);
          },
          onSentenceEnd: (sentence) => {
            console.log('✅ 播放完成:', sentence);
          },
          onComplete: (fullText) => {
            console.log('🎉 全部播放完成');
          },
        });
      }

      // 流式调用 AI
      await aiService.sendMessage(
        text,
        { context: { activeSkill: activeSkill?.id } },
        {
          onChunk: (chunk) => {
            currentAIResponse.current += chunk;
            
            // 更新消息内容（流式显示）
            setMessages(prev => prev.map(msg =>
              msg.id === messageId
                ? { ...msg, content: currentAIResponse.current }
                : msg
            ));
            
            // 添加到语音队列（如果启用）
            if (autoPlayEnabled) {
              speechManager.current?.addChunk(chunk);
            }
          },
          onComplete: () => {
            // 标记流式完成，播放剩余内容
            if (autoPlayEnabled) {
              speechManager.current?.markComplete();
            }
            setIsLoading(false);
          },
          onError: (err) => {
            console.error('AI 调用失败:', err);
            setError(err.message);
            setIsLoading(false);
          },
          onToolCall: (toolName, args) => {
            console.log('🔧 AI 调用工具:', toolName, args);
          },
        }
      );

    } catch (err: any) {
      console.error('发送消息失败:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // 处理语音输入
  const handleSpeech = async (text: string) => {
    if (text.trim()) {
      await handleSend(text);
    }
  };

  // 生成消息 ID
  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // 切换语音播放
  const toggleAutoPlay = async () => {
    const newValue = !autoPlayEnabled;
    setAutoPlayEnabled(newValue);
    
    if (!newValue) {
      await speechManager.current?.stop();
    }
  };

  // 退出 Skill
  const handleExitSkill = () => {
    if (activeSkill) {
      deactivateSkill(activeSkill);
      setActiveSkill(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部状态栏 */}
      {activeSkill && (
        <View style={styles.skillBar}>
          <Text style={styles.skillText}>
            🎯 {activeSkill.name} 模式中
          </Text>
          <TouchableOpacity onPress={handleExitSkill}>
            <Ionicons name="close-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages.filter(m => m.role !== 'system')}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            role={item.role as 'user' | 'assistant'}
            content={item.content}
            timestamp={item.timestamp}
            images={item.images as any}
          />
        )}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* 加载指示器 */}
      {isLoading && (
        <LoadingIndicator text="思考中..." />
      )}

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        {/* 语音播放开关 */}
        <TouchableOpacity
          style={[styles.iconButton, autoPlayEnabled && styles.iconButtonActive]}
          onPress={toggleAutoPlay}
          accessibilityLabel={autoPlayEnabled ? '关闭语音播放' : '开启语音播放'}
        >
          <Ionicons
            name={autoPlayEnabled ? 'volume-high' : 'volume-mute'}
            size={24}
            color={autoPlayEnabled ? '#4CAF50' : '#999'}
          />
        </TouchableOpacity>

        {/* 文本输入 */}
        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          disabled={isLoading}
        />

        {/* 语音输入 */}
        <VoiceInput
          onSpeechRecognized={handleSpeech}
          onSpeechError={(err) => setError(err.message)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  skillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  iconButtonActive: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
});
