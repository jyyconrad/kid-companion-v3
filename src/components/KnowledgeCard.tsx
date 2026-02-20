import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type KnowledgeCategory = 'animal' | 'plant' | 'space' | 'human' | 'physics' | 'chemistry';

export interface Knowledge {
  id: string;
  title: string;
  category: KnowledgeCategory;
  icon?: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

interface KnowledgeCardProps {
  knowledge: Knowledge;
  onPress: () => void;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ knowledge, onPress }) => {
  const getCategoryIcon = () => {
    switch (knowledge.category) {
      case 'animal':
        return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop';
      case 'plant':
        return 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100&h=100&fit=crop';
      case 'space':
        return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop';
      case 'human':
        return 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=100&h=100&fit=crop';
      case 'physics':
        return 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=100&h=100&fit=crop';
      case 'chemistry':
        return 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&h=100&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop';
    }
  };

  const getCategoryText = () => {
    switch (knowledge.category) {
      case 'animal':
        return '动物世界';
      case 'plant':
        return '植物王国';
      case 'space':
        return '太空探索';
      case 'human':
        return '人体奥秘';
      case 'physics':
        return '物理百科';
      case 'chemistry':
        return '化学天地';
      default:
        return '科学知识';
    }
  };

  const getDifficultyColor = () => {
    switch (knowledge.difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FFC107';
      case 'hard':
        return '#FF5722';
      default:
        return '#607D8B';
    }
  };

  const getDifficultyText = () => {
    switch (knowledge.difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Image
          source={{ uri: knowledge.icon || getCategoryIcon() }}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {knowledge.title}
            </Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
              <Text style={styles.difficultyText}>{getDifficultyText()}</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {knowledge.description}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.categoryText}>{getCategoryText()}</Text>
            <Text style={styles.date}>
              {knowledge.createdAt.toLocaleDateString('zh-CN')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 40,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
