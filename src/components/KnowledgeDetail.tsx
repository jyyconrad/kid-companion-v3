import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Knowledge, KnowledgeCategory } from '../components/KnowledgeCard';

interface KnowledgeDetailProps {
  knowledge: Knowledge;
  onBack: () => void;
}

export const KnowledgeDetail: React.FC<KnowledgeDetailProps> = ({ knowledge, onBack }) => {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>知识详情</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: knowledge.icon || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop' }}
          style={styles.coverImage}
        />

        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{knowledge.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
              <Text style={styles.difficultyText}>{getDifficultyText()}</Text>
            </View>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryText()}</Text>
          </View>

          <Text style={styles.description}>{knowledge.description}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>详细内容</Text>
            <Text style={styles.content}>
              这是关于"{knowledge.title}"的详细科学知识内容。在实际应用中，我们会从AI API获取详细的科普内容，
              包含图文并茂的解释，让儿童更容易理解科学知识。
            </Text>
            <Text style={styles.content}>
              科学知识模块会根据儿童的年龄和认知水平，提供不同难度的内容，帮助他们在玩中学，
              培养对科学的兴趣和探索精神。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>趣味问答</Text>
            <View style={styles.questionContainer}>
              <Text style={styles.question}>Q: 为什么天空是蓝色的？</Text>
              <Text style={styles.answer}>A: 因为空气分子会散射蓝色光...</Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.question}>Q: 植物如何制造食物？</Text>
              <Text style={styles.answer}>A: 通过光合作用，利用阳光、水和二氧化碳...</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>相关推荐</Text>
            <View style={styles.recommendationContainer}>
              <TouchableOpacity style={styles.recommendationItem}>
                <Ionicons name="book" size={24} color="#4A90E2" />
                <Text style={styles.recommendationText}>相关书籍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recommendationItem}>
                <Ionicons name="play" size={24} color="#4A90E2" />
                <Text style={styles.recommendationText}>视频教程</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recommendationItem}>
                <Ionicons name="game-controller" size={24} color="#4A90E2" />
                <Text style={styles.recommendationText}>互动游戏</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  infoContainer: {
    padding: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 16,
    lineHeight: 32,
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
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  questionContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  question: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  recommendationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
    justifyContent: 'center',
  },
  recommendationText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 8,
  },
});
