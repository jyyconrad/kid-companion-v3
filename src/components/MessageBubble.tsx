import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { MarkdownRenderer, ImageResult } from './MarkdownRenderer';
import { useAppConfig } from '../store/useAppConfig';

export interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  images?: ImageResult[];
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  role, 
  content, 
  timestamp,
  images 
}) => {
  const isUser = role === 'user';
  const { language = 'zh-CN' } = useAppConfig.getState();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleImagePress = (image: ImageResult) => {
    // 可以在这里实现图片预览
    console.log('Image pressed:', image.title);
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <Text style={styles.userText}>{content}</Text>
        ) : (
          <MarkdownRenderer 
            content={content}
            images={images}
            onLinkPress={handleLinkPress}
            onImagePress={handleImagePress}
          />
        )}
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {new Date(timestamp).toLocaleTimeString(language, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    backgroundColor: '#E5E5EA',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#fff',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#000',
    fontSize: 16,
    lineHeight: 22,
  },
  paragraph: {
    marginBottom: 4,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    borderRadius: 3,
    fontSize: 14,
  },
});
