import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppConfig } from '../store/useAppConfig';

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface ModelSelectScreenProps {
  // Props from navigation
}

export const ModelSelectScreen: React.FC<ModelSelectScreenProps> = (props) => {
  const config = useAppConfig();
  const [selectedChatModel, setSelectedChatModel] = useState(config.models.chat || 'deepseek-ai/DeepSeek-V3.2');
  const [selectedStoryModel, setSelectedStoryModel] = useState(config.models.story || 'deepseek-ai/DeepSeek-V3.2');
  const [selectedScienceModel, setSelectedScienceModel] = useState(config.models.science || 'deepseek-ai/DeepSeek-V3.2');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载可用的模型列表
  useEffect(() => {
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    const { apiUrl, apiKey } = config;

    if (!apiUrl || !apiKey) {
      setError('请先配置 API URL 和 Key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取模型列表失败: ${response.statusText}`);
      }

      const data = await response.json();
      const modelIds = data.data.map((model: Model) => model.id);
      setAvailableModels(modelIds);

      // 如果之前选择的模型不在列表中，选择 DeepSeek V3.2 或第一个模型
      const defaultModel = 'deepseek-ai/DeepSeek-V3.2';
      if (!modelIds.includes(selectedChatModel) && modelIds.length > 0) {
        setSelectedChatModel(modelIds.includes(defaultModel) ? defaultModel : modelIds[0]);
      }
      if (!modelIds.includes(selectedStoryModel) && modelIds.length > 0) {
        setSelectedStoryModel(modelIds.includes(defaultModel) ? defaultModel : modelIds[0]);
      }
      if (!modelIds.includes(selectedScienceModel) && modelIds.length > 0) {
        setSelectedScienceModel(modelIds.includes(defaultModel) ? defaultModel : modelIds[0]);
      }
    } catch (error) {
      console.error('Load models error:', error);
      setError('加载模型列表失败，请检查API配置');
    } finally {
      setIsLoading(false);
    }
  };

  const testApiConnection = async (): Promise<boolean> => {
    const { apiUrl, apiKey, models } = config;
    
    if (!apiUrl || !apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedChatModel || models.chat,
          messages: [
            { role: 'user', content: '你好，你能做什么？请用简短的一句话回答。' }
          ],
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 调用失败：${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      
      if (reply) {
        Alert.alert(
          '✅ API 测试成功！',
          `AI 回复：${reply}\n\n接下来让我们为孩子创建一个个性化的 AI 伙伴吧！`,
          [
            {
              text: '下一步',
              onPress: () => {
                setTimeout(() => {
                  navigation.navigate('WizardScreen' as never);
                }, 200);
              }
            }
          ]
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('API test error:', error);
      Alert.alert('❌ API 测试失败', '请检查 API 配置和网络连接');
      return false;
    }
  };

  const handleSave = async () => {
    if (!selectedChatModel || !selectedStoryModel || !selectedScienceModel) {
      Alert.alert('提示', '请为每个场景选择模型');
      return;
    }

    // 同步更新 store
    config.updateConfig({
      models: {
        chat: selectedChatModel,
        story: selectedStoryModel,
        science: selectedScienceModel,
      },
    });
    
    // 异步保存并等待完成
    await config.saveConfig();
    
    // 保存成功后测试 API
    Alert.alert(
      '保存成功',
      '模型配置已保存，是否测试 API 连接？',
      [
        {
          text: '跳过',
          style: 'cancel',
          onPress: () => {
            setTimeout(() => {
              navigation.navigate('WizardScreen' as never);
            }, 200);
          }
        },
        {
          text: '测试',
          onPress: () => {
            testApiConnection();
          }
        }
      ]
    );
  };

  const handleRetry = () => {
    loadAvailableModels();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>加载模型列表...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={60} color="#FF5252" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {availableModels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>没有可用的模型</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>重新加载</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>聊天模型</Text>
              <View style={styles.modelList}>
                {availableModels.map((model) => (
                  <TouchableOpacity
                    key={`chat-${model}`}
                    style={[
                      styles.modelItem,
                      selectedChatModel === model && styles.modelItemSelected,
                    ]}
                    onPress={() => setSelectedChatModel(model)}
                  >
                    <Text
                      style={[
                        styles.modelName,
                        selectedChatModel === model && styles.modelNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {model}
                    </Text>
                    {selectedChatModel === model && (
                      <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>故事模型</Text>
              <View style={styles.modelList}>
                {availableModels.map((model) => (
                  <TouchableOpacity
                    key={`story-${model}`}
                    style={[
                      styles.modelItem,
                      selectedStoryModel === model && styles.modelItemSelected,
                    ]}
                    onPress={() => setSelectedStoryModel(model)}
                  >
                    <Text
                      style={[
                        styles.modelName,
                        selectedStoryModel === model && styles.modelNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {model}
                    </Text>
                    {selectedStoryModel === model && (
                      <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>科普模型</Text>
              <View style={styles.modelList}>
                {availableModels.map((model) => (
                  <TouchableOpacity
                    key={`science-${model}`}
                    style={[
                      styles.modelItem,
                      selectedScienceModel === model && styles.modelItemSelected,
                    ]}
                    onPress={() => setSelectedScienceModel(model)}
                  >
                    <Text
                      style={[
                        styles.modelName,
                        selectedScienceModel === model && styles.modelNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {model}
                    </Text>
                    {selectedScienceModel === model && (
                      <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  modelList: {
    gap: 8,
    paddingHorizontal: 16,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modelItemSelected: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    backgroundColor: '#F0F7FF',
  },
  modelName: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  modelNameSelected: {
    fontWeight: '600',
    color: '#4A90E2',
  },
  saveButton: {
    margin: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
});
