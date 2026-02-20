import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onNavigateToChat?: () => void;
  onNavigateToStory?: () => void;
  onNavigateToScience?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToChat = () => {},
  onNavigateToStory = () => {},
  onNavigateToScience = () => {},
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* 欢迎部分 */}
        <View style={styles.welcomeSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=200&fit=crop' }}
            style={styles.welcomeImage}
          />
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>欢迎来到 KidCompanion!</Text>
            <Text style={styles.welcomeSubtitle}>
              这里有有趣的故事、知识和AI陪伴
            </Text>
          </View>
        </View>

        {/* 功能快速入口 */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>快速开始</Text>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onNavigateToChat}
          >
            <View style={[styles.quickActionIcon, styles.chatIcon]}>
              <Ionicons name="chatbubbles" size={32} color="white" />
            </View>
            <Text style={styles.quickActionText}>和AI聊天</Text>
            <Text style={styles.quickActionSubtext}>分享你的想法</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onNavigateToStory}
          >
            <View style={[styles.quickActionIcon, styles.storyIcon]}>
              <Ionicons name="book" size={32} color="white" />
            </View>
            <Text style={styles.quickActionText}>听故事</Text>
            <Text style={styles.quickActionSubtext}>精彩故事等你</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onNavigateToScience}
          >
            <View style={[styles.quickActionIcon, styles.scienceIcon]}>
              <Ionicons name="school" size={32} color="white" />
            </View>
            <Text style={styles.quickActionText}>学知识</Text>
            <Text style={styles.quickActionSubtext}>探索科学世界</Text>
          </TouchableOpacity>
        </View>

        {/* 每日推荐 */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>每日推荐</Text>
          
          <TouchableOpacity style={styles.recommendationCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=150&fit=crop' }}
              style={styles.recommendationImage}
            />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>神奇的动物世界</Text>
              <Text style={styles.recommendationDescription}>
                今天为你推荐：为什么变色龙会变色？
              </Text>
              <Text style={styles.recommendationTime}>2分钟前</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recommendationCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=150&fit=crop' }}
              style={styles.recommendationImage}
            />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>探索太空</Text>
              <Text style={styles.recommendationDescription}>
                为什么星星会闪烁？
              </Text>
              <Text style={styles.recommendationTime}>1小时前</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 教育特色 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>我们的特色</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="sparkles" size={32} color="#4A90E2" />
            </View>
            <Text style={styles.featureTitle}>AI智能陪伴</Text>
            <Text style={styles.featureDescription}>
              专业的儿童AI助手，用简单易懂的语言回答问题
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="book" size={32} color="#4A90E2" />
            </View>
            <Text style={styles.featureTitle}>趣味学习</Text>
            <Text style={styles.featureDescription}>
              通过故事和互动游戏学习科学知识
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#4A90E2" />
            </View>
            <Text style={styles.featureTitle}>安全可靠</Text>
            <Text style={styles.featureDescription}>
              内容经过严格审核，适合儿童使用
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部导航提示 */}
      <View style={styles.bottomNavigationHint}>
        <Text style={styles.bottomNavigationText}>
          👆 点击底部导航探索更多功能 👇
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F5F5F5',
  },
  welcomeContent: {
    padding: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatIcon: {
    backgroundColor: '#4A90E2',
  },
  storyIcon: {
    backgroundColor: '#FFC107',
  },
  scienceIcon: {
    backgroundColor: '#4CAF50',
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quickActionSubtext: {
    fontSize: 14,
    color: '#666',
  },
  recommendationsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  recommendationContent: {
    padding: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendationTime: {
    fontSize: 12,
    color: '#999',
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 100,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomNavigationHint: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavigationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
