import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Story } from './StoryCard';

export interface StoryPlayerProps {
  title: string;
  content: string;
  language?: string;
  isPlaying?: boolean;
  onPlay?: () => Promise<void>;
  onPause?: () => void;
  onBack?: () => void;
  story?: Story;  // 新增：支持传入 story 对象
}

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ story, title, content, language = 'zh-CN' }) => {
  // 如果传入 story 对象，使用 story 的数据
  const displayTitle = story?.title || title;
  const displayContent = story?.content || content;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // 简化的 TTS 状态管理，使用 Expo Speech API 的回调


  const handlePlay = async () => {
    try {
      if (!isPaused) {
        // 开始播放
        setIsPlaying(true);
        setSpeaking(true);
        await Speech.speak(content, {
          language,
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            setIsPlaying(false);
            setIsPaused(false);
            setSpeaking(false);
          },
          onStopped: () => {
            setIsPlaying(false);
            setIsPaused(false);
            setSpeaking(false);
          },
          onError: (error) => {
            console.error('语音播放错误:', error);
            setIsPlaying(false);
            setIsPaused(false);
            setSpeaking(false);
            Alert.alert('播放错误', '语音播放失败，请重试');
          },
        });
      } else {
        // 继续播放
        setIsPlaying(true);
        setSpeaking(true);
        await Speech.resume();
      }
    } catch (error) {
      console.error('播放失败:', error);
      setIsPlaying(false);
      setIsPaused(false);
      setSpeaking(false);
      Alert.alert('播放错误', '语音播放失败，请重试');
    }
  };

  const handlePause = async () => {
    try {
      await Speech.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } catch (error) {
      console.error('暂停失败:', error);
    }
  };

  const handleStop = async () => {
    try {
      await Speech.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setSpeaking(false);
    } catch (error) {
      console.error('停止失败:', error);
    }
  };

  const handleSpeedChange = (speed: number) => {
    Alert.alert('语速设置', `语速已设置为 ${speed}x`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>{content}</Text>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={isPlaying ? handlePause : handlePlay}
          disabled={speaking && isPlaying}
        >
          <Ionicons
            name={isPlaying ? 'pause' : isPaused ? 'play' : 'play'}
            size={24}
            color="white"
          />
          <Text style={styles.controlButtonText}>
            {isPlaying ? '暂停' : isPaused ? '继续' : '播放'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButtonSecondary}
          onPress={handleStop}
          disabled={!speaking}
        >
          <Ionicons name="stop" size={20} color="#4A90E2" />
          <Text style={styles.controlButtonTextSecondary}>停止</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButtonSecondary}
          onPress={() => handleSpeedChange(0.8)}
        >
          <Ionicons name="speedometer" size={20} color="#4A90E2" />
          <Text style={styles.controlButtonTextSecondary}>0.8x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    lineHeight: 28,
    color: '#666',
    textAlign: 'justify',
  },
  controls: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  controlButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  controlButtonTextSecondary: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
