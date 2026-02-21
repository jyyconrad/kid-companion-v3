import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuideStep1Props {
  onNext: () => void;
}

export const GuideStep1: React.FC<GuideStep1Props> = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="happy" size={80} color="#4A90E2" />
        </View>

        <Text style={styles.title}>欢迎来到小伴童！</Text>

        <Text style={styles.description}>
          我是您的AI儿童智能伙伴，陪伴孩子聊天、讲故事、学知识。
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="chatbubbles" size={32} color="#81C784" />
            <Text style={styles.featureText}>智能聊天</Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="book" size={32} color="#FFB74D" />
            <Text style={styles.featureText}>趣味故事</Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="school" size={32} color="#64B5F6" />
            <Text style={styles.featureText}>科普问答</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>开始使用</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  feature: {
    alignItems: 'center',
    width: 100,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
