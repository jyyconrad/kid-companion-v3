import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { aiService, Message as AIMessage } from '../services/aiService';
import { useAppConfig } from '../store/useAppConfig';

export const ChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const flatListRef = useRef<FlatList<AIMessage>>(null);
  const config = useAppConfig();

  // 启动时加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    await config.loadConfig();
    setIsConfigLoaded(true);
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

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

    // 确保配置已加载
    if (!isConfigLoaded) {
      Alert.alert('提示', '正在加载配置，请稍后...');
      return;
    }

    if (!config.apiKey) {
      Alert.alert('提示', '请先在"我的"页面配置API');
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

    try {
      // 调用AI服务
      const response = await aiService.sendMessage(messages, (chunk) => {
        // TODO: 实现流式输出
        console.log('Chunk:', chunk);
      });

      const aiMessage: AIMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('聊天请求失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`聊天请求失败：${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: AIMessage }) => {
    return <MessageBubble message={
      {
        id: item.id,
        type: item.role === 'user' ? 'user' : 'ai',
        content: item.content,
        timestamp: new Date(item.timestamp),
      }
    } />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {!isConfigLoaded ? (
                <Text style={styles.loadingText}>正在加载配置...</Text>
              ) : (
                <>
                  <Text style={styles.emptyText}>
                    我是{config.persona.aiName}，很高兴认识你！
                  </Text>
                  <Text style={styles.emptySubText}>
                    {config.persona.chatStyle} · 开始聊天吧！
                  </Text>
                  {!config.apiKey && (
                    <Text style={styles.configHint}>
                      请先在"我的"页面配置API
                    </Text>
                  )}
                </>
              )}
            </View>
          }
        />
        {isLoading && <LoadingIndicator />}
      </View>
      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </SafeAreaView>
  );
};

const { Text } = require('react-native');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  configHint: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 16,
    textAlign: 'center',
  },
});
