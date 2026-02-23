import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAppConfig } from '../store/useAppConfig';

export type StoryCategory = 'fairy' | 'adventure' | 'science' | 'animal';

export interface Story {
  id: string;
  title: string;
  category: StoryCategory;
  coverImage?: string;
  summary: string;
  duration: string;
  createdAt: Date;
}

interface StoryCardProps {
  story: Story;
  onPress: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onPress }) => {
  const { language = 'zh-CN' } = useAppConfig.getState();
  const getCategoryIcon = () => {
    switch (story.category) {
      case 'fairy':
        return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=150&fit=crop';
      case 'adventure':
        return 'https://images.unsplash.com/photo-1533686882111-6841e8862c34?w=200&h=150&fit=crop';
      case 'science':
        return 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=200&h=150&fit=crop';
      case 'animal':
        return 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=150&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=150&fit=crop';
    }
  };

  const getCategoryText = () => {
    switch (story.category) {
      case 'fairy':
        return '童话故事';
      case 'adventure':
        return '冒险故事';
      case 'science':
        return '科普故事';
      case 'animal':
        return '动物故事';
      default:
        return '故事';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: story.coverImage || getCategoryIcon() }}
        style={styles.coverImage}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {story.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryText()}</Text>
          </View>
        </View>
        <Text style={styles.summary} numberOfLines={2}>
          {story.summary}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.duration}>{story.duration}</Text>
          <Text style={styles.date}>
            {story.createdAt.toLocaleDateString(language)}
          </Text>
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
    flexDirection: 'row',
    overflow: 'hidden',
  },
  coverImage: {
    width: 120,
    height: 100,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  summary: {
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
  duration: {
    fontSize: 12,
    color: '#999',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
