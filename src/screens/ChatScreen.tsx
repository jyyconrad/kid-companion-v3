import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
} from 'react-native';
import * as Speech from 'expo-speech';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { VoiceInput } from '../components/VoiceInput';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { aiService, Message as AIMessage } from '../services/aiService';
import { useAppConfig } from '../store/useAppConfig';

export const ChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const flatListRef = useRef<FlatList<AIMessage>>(null);
  const config = useAppConfig();
  const currentAIResponse = useRef<string>('');

  // 启动时加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    await config.loadConfig();
    setIsConfigLoaded(true);
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
