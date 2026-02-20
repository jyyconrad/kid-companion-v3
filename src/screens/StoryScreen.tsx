import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoryCard, Story, StoryCategory } from '../components/StoryCard';
import { StoryPlayer } from '../components/StoryPlayer';

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

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      const categoryText = CATEGORIES.find(cat => cat.value === selectedCategory)?.label || '故事';
      
      // 模拟生成故事（实际应该调用API）
      const mockStories: Record<string, { title: string; content: string; duration: string }> = {
        fairy: {
          title: '勇敢的小兔子',
          content: '从前有一只勇敢的小兔子，它住在一个美丽的森林里。有一天，小兔子听说森林深处有一只受伤的小鸟，于是它决定去帮助它。小兔子穿过茂密的树林，跨过湍急的小溪，终于找到了那只受伤的小鸟。它小心翼翼地把小鸟抱回家，细心地照顾它。几天后，小鸟痊愈了，它感谢小兔子的帮助，并成为了好朋友。',
          duration: '3分钟'
        },
        adventure: {
          title: '太空探险',
          content: '小明梦想成为一名宇航员。有一天，他乘坐飞船开始了太空探险之旅。他看到了美丽的地球，遇到了友好的外星人，还发现了一个新的星球。在太空中，小明学会了勇敢和独立，这次探险让他明白了探索未知的重要性。',
          duration: '5分钟'
        },
        science: {
          title: '植物的秘密',
          content: '你知道吗？植物也有自己的语言。它们通过根部释放化学物质来交流。当一棵植物受到昆虫攻击时，它会向邻居植物发送警告信号，帮助它们做好防御准备。科学家们正在研究如何更好地理解植物的沟通方式。',
          duration: '4分钟'
        },
        animal: {
          title: '聪明的海豚',
          content: '海豚是海洋中最聪明的动物之一。它们会用复杂的声纳系统来导航和寻找食物。海豚还会互相帮助，当有同伴受伤时，其他海豚会围成一个圈保护它。它们还喜欢和人类玩耍，经常在船边跳跃。',
          duration: '4分钟'
        }
      };

      const mockStory = mockStories[selectedCategory] || mockStories.fairy;
      const parsedStory = {
        title: mockStory.title,
        summary: mockStory.content.substring(0, 100) + '...',
        duration: mockStory.duration
      };

      const newStory: Story = {
        id: generateMessageId(),
        title: parsedStory.title,
        category: selectedCategory,
        summary: parsedStory.summary,
        createdAt: new Date(),
        duration: parsedStory.duration,
      };

      setStories(prev => [newStory, ...prev]);
      setSelectedStory(newStory);
    } catch (error) {
      console.error('故事生成失败:', error);
      Alert.alert('生成失败', '故事生成失败，请检查网络连接或API配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseGeneratedStory = (text: string): { title: string; summary: string; duration: string } => {
    const titleMatch = text.match(/标题：\s*(.*?)(?=\n|内容：)/);
    const title = titleMatch ? titleMatch[1].trim() : '精彩故事';

    const contentMatch = text.match(/内容：\s*([\s\S]*?)(?=\n时长：|$)/);
    const content = contentMatch ? contentMatch[1].trim() : '这是一个精彩的故事...';

    const durationMatch = text.match(/时长：\s*(.*)/);
    const duration = durationMatch ? durationMatch[1].trim() : '5分钟';

    return {
      title,
      summary: content.substring(0, 100) + '...',
      duration,
    };
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
  };

  const handleBack = () => {
    setSelectedStory(null);
  };

  const renderStoryItem = ({ item }: { item: Story }) => {
    return (
      <StoryCard story={item} onPress={() => handleStorySelect(item)} />
    );
  };

  if (selectedStory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedStory.title}</Text>
          <View style={styles.placeholder} />
        </View>
        <StoryPlayer
          title={selectedStory.title}
          content="这是故事的完整内容。在实际应用中，我们会从API获取完整的故事内容。"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>故事天地</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => setStories([])}>
          <Ionicons name="refresh" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryButton,
              selectedCategory === category.value && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.value)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.value && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={handleGenerateStory}
        disabled={isGenerating}
      >
        <Ionicons
          name="sparkles"
          size={20}
          color={isGenerating ? '#999' : 'white'}
        />
        <Text style={styles.generateButtonText}>
          {isGenerating ? '生成中...' : '生成新故事'}
        </Text>
      </TouchableOpacity>

      {stories.length > 0 ? (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="book" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>还没有故事</Text>
          <Text style={styles.emptyStateSubtext}>点击"生成新故事"开始创作</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    overflow: 'hidden',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4A90E2',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  storiesList: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
