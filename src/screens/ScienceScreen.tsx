import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { KnowledgeCard, Knowledge, KnowledgeCategory } from '../components/KnowledgeCard';
import { KnowledgeDetail } from '../components/KnowledgeDetail';
import { aiService } from '../services/aiService';
import { useAppConfig } from '../store/useAppConfig';

const CATEGORIES: { value: KnowledgeCategory; label: string }[] = [
  { value: 'animal', label: '动物世界' },
  { value: 'plant', label: '植物王国' },
  { value: 'space', label: '太空探索' },
  { value: 'human', label: '人体奥秘' },
  { value: 'physics', label: '物理百科' },
  { value: 'chemistry', label: '化学天地' },
];

export const ScienceScreen: React.FC = () => {
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const config = useAppConfig();
  const currentKnowledgeContent = useRef<string>('');

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    if (!config.apiKey) {
      Alert.alert('提示', '请先在"我的"页面配置 API');
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    currentKnowledgeContent.current = '';
    
    try {
      const categoryText = selectedCategory === 'all' 
        ? '科学' 
        : CATEGORIES.find(cat => cat.value === selectedCategory)?.label || '科学';

      const prompt = `请为小朋友解释"${searchText.trim()}"这个${categoryText}知识点，要求：
1. 语言简单易懂，适合儿童理解
2. 使用比喻和例子帮助理解
3. 有趣生动，能激发好奇心
4. 长度 200-400 字
5. 使用 Markdown 格式

请按以下格式输出：
# 标题
内容...`;

      // 调用 AI 服务（流式输出）
      const response = await aiService.sendMessage(prompt, {
        context: { isScience: true }
      }, (chunk: string) => {
        currentKnowledgeContent.current += chunk;
        setStreamingContent(currentKnowledgeContent.current);
      });

      const content = response || currentKnowledgeContent.current;
      const parsedKnowledge = parseGeneratedKnowledge(content);

      const newKnowledge: Knowledge = {
        id: generateMessageId(),
        title: parsedKnowledge.title,
        category: selectedCategory === 'all' ? 'animal' : selectedCategory,
        description: parsedKnowledge.content,
        content: parsedKnowledge.content,
        difficulty: 'easy',
        createdAt: new Date(),
      };

      setKnowledges(prev => [newKnowledge, ...prev]);
      setSelectedKnowledge(newKnowledge);

      // 自动播放语音
      await Speech.speak(parsedKnowledge.content, {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.9,
      });

    } catch (error) {
      console.error('知识查询失败:', error);
      Alert.alert('查询失败', '知识查询失败，请检查网络连接或 API 配置');
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
    }
  };

  const parseGeneratedKnowledge = (text: string): { title: string; content: string } => {
    // 提取标题（Markdown 格式 # 标题）
    const titleMatch = text.match(/^#\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : searchText.trim();

    // 提取内容（标题后的所有文本）
    const contentMatch = text.match(/^#\s*.+\n([\s\S]*)$/m);
    const content = contentMatch ? contentMatch[1].trim() : text;

    return {
      title,
      content,
    };
  };

  const handlePlayKnowledge = async (knowledge: Knowledge) => {
    try {
      await Speech.speak(knowledge.content || knowledge.description, {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('语音播放失败:', error);
    }
  };

  const handleKnowledgeSelect = (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge);
    handlePlayKnowledge(knowledge);
  };

  const handleBack = () => {
    Speech.stop();
    setSelectedKnowledge(null);
  };

  const filteredKnowledges = knowledges.filter(knowledge => {
    const matchesCategory = selectedCategory === 'all' || knowledge.category === selectedCategory;
    const matchesSearch = !searchText.trim() || 
      knowledge.title.toLowerCase().includes(searchText.toLowerCase()) ||
      knowledge.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderKnowledgeItem = ({ item }: { item: Knowledge }) => {
    return (
      <KnowledgeCard 
        knowledge={item} 
        onPress={() => handleKnowledgeSelect(item)} 
      />
    );
  };

  if (selectedKnowledge) {
    return (
      <KnowledgeDetail 
        knowledge={selectedKnowledge} 
        onBack={handleBack}
        onPlay={() => handlePlayKnowledge(selectedKnowledge)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>科学知识</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => setKnowledges([])}>
          <Ionicons name="refresh" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索科学知识..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="send" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'all' && styles.categoryTextActive,
            ]}
          >
            全部
          </Text>
        </TouchableOpacity>
      </View>

      {streamingContent.length > 0 && (
        <View style={styles.streamingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.streamingText}>正在查询知识...</Text>
        </View>
      )}

      <FlatList
        data={filteredKnowledges}
        renderItem={renderKnowledgeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.knowledgeList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bulb" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>还没有知识卡片</Text>
            <Text style={styles.emptySubtext}>搜索你感兴趣的话题</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  categoryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
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
  streamingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F7FF',
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  streamingText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  knowledgeList: {
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
