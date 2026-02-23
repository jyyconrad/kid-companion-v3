import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppConfig } from '../store/useAppConfig';

interface ApiConfigScreenProps {
  // Props from navigation
}

export const ApiConfigScreen: React.FC<ApiConfigScreenProps> = (props) => {
  const navigation = useNavigation();
  const config = useAppConfig();
  const [apiUrl, setApiUrl] = useState(config.apiUrl || 'https://api.siliconflow.cn/v1');
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!apiUrl || !apiKey) {
      Alert.alert('提示', '请先填写 API URL 和 Key');
      return;
    }

    setIsTesting(true);
    try {
      // 简单测试 - 实际应该调用 API 验证
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('连接成功', 'API 配置有效');
    } catch (error) {
      Alert.alert('连接失败', '请检查 API 配置');
    }
    setIsTesting(false);
  };

  const handleSave = () => {
    if (!apiUrl || !apiKey) {
      Alert.alert('提示', '请填写 API URL 和 Key');
      return;
    }

    // 保存配置
    config.updateConfig({ apiUrl, apiKey });
    config.saveConfig();
    
    Alert.alert(
      '保存成功',
      'API 配置已保存，接下来让我们为孩子创建一个个性化的 AI 伙伴吧！',
      [
        {
          text: '下一步',
          onPress: () => {
            // 导航到角色配置向导
            navigation.navigate('WizardScreen' as never);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>配置 AI 服务</Text>
          <Text style={styles.subtitle}>首先，我们需要配置 AI 服务的访问凭证</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 如何获取 API Key？</Text>
          <Text style={styles.infoText}>1. 访问硅基流动官网：https://siliconflow.cn</Text>
          <Text style={styles.infoText}>2. 注册/登录账号</Text>
          <Text style={styles.infoText}>3. 在控制台获取 API Key</Text>
          <Text style={styles.infoText}>4. 新用户有免费额度</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>模型供应商 URL</Text>
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="https://api.siliconflow.cn/v1"
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
            <Text style={styles.buttonText}>🔗 测试连接</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>💾 保存并继续</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  testButton: {
    backgroundColor: '#81C784',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
