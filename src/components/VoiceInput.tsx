import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';

interface VoiceInputProps {
  onSpeechRecognized: (text: string) => void;
  onSpeechError?: (error: Error) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onSpeechRecognized,
  onSpeechError,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初始化语音识别
    Voice.onSpeechStart = () => {
      console.log('语音识别开始');
      setIsRecording(true);
      setError(null);
    };

    Voice.onSpeechEnd = () => {
      console.log('语音识别结束');
      setIsRecording(false);
    };

    Voice.onSpeechResults = (e) => {
      const text = e.value?.[0] || '';
      console.log('识别结果:', text);
      setRecognizedText(text);
      onSpeechRecognized(text);
    };

    Voice.onSpeechError = (e) => {
      console.error('语音识别错误:', e);
      const error = new Error(e.error?.message || '语音识别失败');
      setError(error.message);
      onSpeechError?.(error);
      setIsRecording(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onSpeechRecognized, onSpeechError]);

  const startRecording = async () => {
    try {
      setError(null);
      setRecognizedText('');
      
      // 检查权限
      const permissions = await Voice.requestPermissions();
      if (!permissions) {
        throw new Error('没有麦克风权限');
      }

      // 开始录音
      await Voice.start('zh-CN');
      setIsRecording(true);
    } catch (err: any) {
      console.error('启动录音失败:', err);
      setError(err.message || '启动录音失败');
      onSpeechError?.(err);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (err: any) {
      console.error('停止录音失败:', err);
      setError(err.message || '停止录音失败');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const speakText = async (text: string) => {
    if (!text) return;
    
    try {
      setIsPlaying(true);
      await Voice.speak(text, {
        language: 'zh-CN',
        rate: 0.9,
        pitch: 1.0,
      });
      setIsPlaying(false);
    } catch (err: any) {
      console.error('语音播放失败:', err);
      setError(err.message || '语音播放失败');
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* 语音输入按钮 */}
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.voiceButtonActive,
          ]}
          onPress={toggleRecording}
          disabled={isPlaying}
        >
          {isRecording ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.voiceButtonText}>🎤</Text>
          )}
        </TouchableOpacity>

        {/* 播放按钮（如果有识别文本） */}
        {recognizedText && !isRecording && (
          <TouchableOpacity
            style={[
              styles.playButton,
              isPlaying && styles.playButtonActive,
            ]}
            onPress={() => speakText(recognizedText)}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <ActivityIndicator color="#007AFF" size="small" />
            ) : (
              <Text style={styles.playButtonText}>🔊</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 显示识别结果 */}
      {recognizedText ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>识别结果:</Text>
          <Text style={styles.resultText}>{recognizedText}</Text>
        </View>
      ) : null}

      {/* 显示错误信息 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  voiceButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButtonActive: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.1 }],
  },
  voiceButtonText: {
    fontSize: 24,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#007AFF',
  },
  playButtonText: {
    fontSize: 20,
  },
  resultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  errorText: {
    fontSize: 12,
    color: '#856404',
  },
});

export default VoiceInput;
