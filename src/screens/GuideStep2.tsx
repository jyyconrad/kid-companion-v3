import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppConfig } from '../store/useAppConfig';

interface GuideStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export const GuideStep2: React.FC<GuideStep2Props> = ({ onNext, onBack }) => {
  const config = useAppConfig();
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!apiUrl || !apiKey) {
      Alert.alert('提示', '请先填写API URL和Key');
      return;
    }

    setIsTesting(true);
    try {
      // TODO: 调用AI服务测试连接
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('连接成功', 'API配置有效');
    } catch (error) {
      Alert.alert('连接失败', '请检查API配置');
    }
    setIsTesting(false);
  };

  const handleNext = () => {
    if (!apiUrl || !apiKey) {
      Alert.alert('提示', '请填写API URL和Key');
      return;
    }

    config.updateConfig({ apiUrl, apiKey });
    config.saveConfig();
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.step}>步骤 2/3</Text>
        <Text style={styles.title}>配置API</Text>
        <Text style={styles.description}>
          请输入您的AI服务提供商的API信息
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>模型供应商URL</Text>
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="https://api.openai.com/v1"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTestConnection}
          disabled={isTesting}
        >
          {isTesting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>测试连接</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>上一步</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>下一步</Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 32,
  },
  step: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#81C784',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  testButton: {
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
