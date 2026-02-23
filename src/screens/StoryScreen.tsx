import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { StoryCard, Story, StoryCategory } from '../components/StoryCard';
import { StoryPlayer } from '../components/StoryPlayer';
import { aiService } from '../services/aiService';
import { useAppConfig } from '../store/useAppConfig';

const CATEGORIES: { value: StoryCategory; label: string }[] = [
  { value: 'fairy', label: '童话故事' },
  { value: 'adventure', label: '冒险故事' },
  { value: 'science', label: '科普故事' },
  { value: 'animal', label: '动物故事' },
];

export const StoryScreen: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('fairy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const config = useAppConfig();
  const currentStoryContent = useRef<string>('');

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleGenerateStory = async () => {
    if (!config.apiKey) {
      Alert.alert('提示', '请先在"我的"页面配置 API');
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    currentStoryContent.current = '';
    
    try {
      const categoryText = CATEGORIES.find(cat => cat.value === selectedCategory)?.label || '故事';
      const prompt = `请为小朋友创作一个${categoryText}，要求：
1. 语言生动有趣，适合儿童阅读
2. 有教育意义
3. 长度 300-500 字
4. 使用 Markdown 格式，包含标题和内容

请按以下格式输出：
# 标题
内容...`;

      // 调用 AI 服务（流式输出）
      const response = await aiService.sendMessage(
        prompt,
        { context: { isStory: true } },
        {
          onChunk: (chunk: string) => {
            // 流式更新内容
            currentStoryContent.current += chunk;
            setStreamingContent(currentStoryContent.current);
          },
        }
      );

      // 解析故事内容
      const parsedStory = parseGeneratedStory(response || currentStoryContent.current);

      const newStory: Story = {
        id: generateMessageId(),
        title: parsedStory.title,
        category: selectedCategory,
        summary: parsedStory.summary,
        content: parsedStory.content,
        createdAt: new Date(),
        duration: parsedStory.duration,
      };

      setStories(prev => [newStory, ...prev]);
      setSelectedStory(newStory);

      // 自动播放语音
      await Speech.speak(parsedStory.content, {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.9,
      });

    } catch (error) {
      console.error('故事生成失败:', error);
      Alert.alert('生成失败', '故事生成失败，请检查网络连接或 API 配置');
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
    }
  };

  const parseGeneratedStory = (text: string): { title: string; content: string; summary: string; duration: string } => {
    // 提取标题（Markdown 格式 # 标题）
    const titleMatch = text.match(/^#\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '精彩故事';

    // 提取内容（标题后的所有文本）
    const contentMatch = text.match(/^#\s*.+\n([\s\S]*)$/m);
    const content = contentMatch ? contentMatch[1].trim() : text;

    // 估算时长（约 200 字/分钟）
    const wordCount = content.length;
    const durationMinutes = Math.ceil(wordCount / 200);
    const duration = `${durationMinutes}分钟`;

    return {
      title,
      content,
      summary: content.substring(0, 100) + '...',
      duration,
    };
  };

  const handlePlayStory = async (story: Story) => {
    setSelectedStory(story);
    setIsPlaying(true);
    
    try {
      await Speech.speak(story.content || story.summary, {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (error) {
      console.error('语音播放失败:', error);
      setIsPlaying(false);
    }
  };

  const handleStopPlaying = () => {
    Speech.stop();
    setIsPlaying(false);
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    handlePlayStory(story);
  };

  const handleBack = () => {
    handleStopPlaying();
    setSelectedStory(null);
  };

  if (selectedStory) {
    return (
      <StoryPlayer
        story={selectedStory}
        title={selectedStory.title}
        content={selectedStory.content || selectedStory.summary}
        isPlaying={isPlaying}
        onPlay={() => handlePlayStory(selectedStory)}
        onPause={handleStopPlaying}
        onBack={handleBack}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>讲故事</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => setStories([])}>
          <Ionicons name="refresh" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.value && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.value && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={handleGenerateStory}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <ActivityIndicator color="white" />
            <Text style={styles.generateButtonText}>正在创作故事...</Text>
          </>
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="white" />
            <Text style={styles.generateButtonText}>生成{CATEGORIES.find(cat => cat.value === selectedCategory)?.label || '故事'}</Text>
          </>
        )}
      </TouchableOpacity>

      {streamingContent.length > 0 && (
        <View style={styles.streamingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.streamingText}>正在创作中...</Text>
        </View>
      )}

      <FlatList
        data={stories}
        renderItem={({ item }) => (
          <StoryCard
            story={item}
            onPress={() => handleStorySelect(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storyList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>还没有故事</Text>
            <Text style={styles.emptySubtext}>点击上方按钮生成精彩故事</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  categoryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryButtonActive: {
    backgroundColor: '#4A90E2',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 14,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  streamingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F7FF',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  streamingText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  storyList: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
  },
});
