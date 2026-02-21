import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const GuideComplete: React.FC = () => {
  const navigation = useNavigation();

  const handleStart = () => {
    navigation.navigate('Chat' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#81C784" />
        </View>

        <Text style={styles.title}>设置完成！</Text>

        <Text style={styles.description}>
          现在可以开始使用小伴童了
        </Text>

        <View style={styles.tips}>
          <View style={styles.tip}>
            <Ionicons name="chatbubbles" size={24} color="#4A90E2" />
            <Text style={styles.tipText}>随时和AI聊天</Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="person" size={24} color="#4A90E2" />
            <Text style={styles.tipText}>在"我的"中调整设置</Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="settings" size={24} color="#4A90E2" />
            <Text style={styles.tipText}>支持OTA自动更新</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>开始使用</Text>
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
  tips: {
    gap: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 15,
    color: '#333',
  },
  startButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
