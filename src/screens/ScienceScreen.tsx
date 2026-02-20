import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KnowledgeCard, Knowledge, KnowledgeCategory } from '../components/KnowledgeCard';
import { KnowledgeDetail } from '../components/KnowledgeDetail';

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

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    setIsGenerating(true);
    try {
      // 模拟搜索（实际应该调用API）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockKnowledge: Knowledge = {
        id: generateMessageId(),
        title: searchText.trim(),
        category: 'animal',
        description: '这是关于' + searchText.trim() + '的科学知识解释。在实际应用中，我们会通过AI API生成详细的内容。',
        difficulty: 'easy',
        createdAt: new Date(),
      };

      setKnowledges(prev => [mockKnowledge, ...prev]);
      setSelectedKnowledge(mockKnowledge);
    } catch (error) {
      console.error('搜索失败:', error);
      Alert.alert('搜索失败', '知识查询失败，请检查网络连接或API配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKnowledgeSelect = (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge);
  };

  const handleBack = () => {
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
      <KnowledgeCard knowledge={item} onPress={() => handleKnowledgeSelect(item)} />
    );
  };

  if (selectedKnowledge) {
    return (
      <KnowledgeDetail knowledge={selectedKnowledge} onBack={handleBack} />
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
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="搜索科学知识..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSearch}
          editable={!isGenerating}
        />
        <TouchableOpacity
          style={[styles.searchButton, (!searchText.trim() || isGenerating) && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!searchText.trim() || isGenerating}
        >
          <Ionicons
            name="search"
            size={20}
            color={searchText.trim() && !isGenerating ? 'white' : '#999'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        {[{ value: 'all', label: '全部' }, ...CATEGORIES].map(category => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryButton,
              selectedCategory === category.value && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.value as KnowledgeCategory | 'all')}
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

      {filteredKnowledges.length > 0 ? (
        <FlatList
          data={filteredKnowledges}
          renderItem={renderKnowledgeItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.knowledgesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="school" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>还没有知识卡片</Text>
          <Text style={styles.emptyStateSubtext}>
            {searchText.trim() ? '搜索相关知识' : '使用搜索框查找科学知识'}
          </Text>
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
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#F5F5F5',
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
  knowledgesList: {
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
