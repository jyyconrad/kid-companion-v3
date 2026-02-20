import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MessageBubble, Message } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useChatStore } from '../store/chatStore';

export const ChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const { messages, isLoading, error, addMessage, setLoading, setError } = useChatStore();

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (error) {
      Alert.alert('聊天错误', error);
    }
  }, [error]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setLoading(true);

    try {
      // 模拟AI回复（实际应该调用API）
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟延迟
      
      const mockResponses = [
        '这是一个很好的问题！让我来告诉你...',
        '哇，你真聪明！这个问题很有趣。',
        '我明白了！让我用简单的方式解释一下。',
        '太棒了！我们一起探索这个话题吧。',
        '好问题！其实很简单...',
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const aiMessage: Message = {
        id: generateMessageId(),
        type: 'ai',
        content: randomResponse + ' （这是模拟回复，实际应该连接真实的AI API）',
        timestamp: new Date(),
      };
      addMessage(aiMessage);
    } catch (err) {
      console.error('聊天请求失败:', err);
      setError('聊天请求失败，请检查网络连接或API配置');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return <MessageBubble message={item} />;
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
        />
        {isLoading && <LoadingIndicator />}
      </View>
      <MessageInput
        onSend={handleSendMessage}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
};

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
});
