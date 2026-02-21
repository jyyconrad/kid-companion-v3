import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppConfig } from '../store/useAppConfig';

interface ModelSelectScreenProps {
  // Props from navigation
}

const PREDEFINED_MODELS = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-haiku',
  'claude-3-sonnet',
  'claude-3-opus',
  'deepseek-chat',
  'deepseek-coder',
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
];

export const ModelSelectScreen: React.FC<ModelSelectScreenProps> = (props) => {
  const config = useAppConfig();
  const [selectedChatModel, setSelectedChatModel] = useState(config.models.chat);
  const [selectedStoryModel, setSelectedStoryModel] = useState(config.models.story);
  const [selectedScienceModel, setSelectedScienceModel] = useState(config.models.science);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleSave = () => {
    config.updateConfig({
      models: {
        chat: selectedChatModel,
        story: selectedStoryModel,
        science: selectedScienceModel,
      },
    });
    config.saveConfig();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>聊天模型</Text>
          <View style={styles.modelList}>
            {PREDEFINED_MODELS.map((model) => (
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
            {PREDEFINED_MODELS.map((model) => (
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
            {PREDEFINED_MODELS.map((model) => (
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modelList: {
    gap: 8,
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
});
