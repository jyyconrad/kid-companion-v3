import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppConfig } from '../store/useAppConfig';

interface FeatureConfigScreenProps {
  // Props from navigation
}

const SEARCH_SOURCES = [
  { id: 'duckduckgo', name: 'DuckDuckGo' },
  { id: 'tavily', name: 'Tavily' },
  { id: 'brave', name: 'Brave Search' },
  { id: 'perplexity', name: 'Perplexity' },
];

export const FeatureConfigScreen: React.FC<FeatureConfigScreenProps> = (props) => {
  const config = useAppConfig();
  const [chatUseSearch, setChatUseSearch] = useState(config.features.chat.useSearch);
  const [chatEnableVoice, setChatEnableVoice] = useState(config.features.chat.enableVoice);
  const [chatSearchCategories, setChatSearchCategories] = useState(
    config.features.chat.searchCategories
  );
  const [scienceUseSearch, setScienceUseSearch] = useState(config.features.science.useSearch);
  const [scienceSearchCategories, setScienceSearchCategories] = useState(
    config.features.science.searchCategories
  );

  const toggleChatSearchCategory = (category: string) => {
    setChatSearchCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  };

  const toggleScienceSearchCategory = (category: string) => {
    setScienceSearchCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  };

  const handleSave = () => {
    config.updateConfig({
      features: {
        chat: {
          useSearch: chatUseSearch,
          enableVoice: chatEnableVoice,
          searchCategories: chatSearchCategories,
        },
        science: {
          useSearch: scienceUseSearch,
          searchCategories: scienceSearchCategories,
        },
      },
    });
    config.saveConfig();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>聊天功能</Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>启用网络检索</Text>
            <Switch
              value={chatUseSearch}
              onValueChange={setChatUseSearch}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={chatUseSearch ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>启用语音转换</Text>
            <Switch
              value={chatEnableVoice}
              onValueChange={setChatEnableVoice}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={chatEnableVoice ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          {chatUseSearch && (
            <View style={styles.searchCategories}>
              <Text style={styles.categoriesLabel}>检索来源</Text>
              {SEARCH_SOURCES.map((source) => (
                <TouchableOpacity
                  key={source.id}
                  style={[
                    styles.categoryItem,
                    chatSearchCategories.includes(source.id) && styles.categoryItemSelected,
                  ]}
                  onPress={() => toggleChatSearchCategory(source.id)}
                >
                  <Text
                    style={[
                      styles.categoryName,
                      chatSearchCategories.includes(source.id) && styles.categoryNameSelected,
                    ]}
                  >
                    {source.name}
                  </Text>
                  {chatSearchCategories.includes(source.id) && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>科普功能</Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>启用网络检索</Text>
            <Switch
              value={scienceUseSearch}
              onValueChange={setScienceUseSearch}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={scienceUseSearch ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          {scienceUseSearch && (
            <View style={styles.searchCategories}>
              <Text style={styles.categoriesLabel}>检索来源</Text>
              {SEARCH_SOURCES.map((source) => (
                <TouchableOpacity
                  key={source.id}
                  style={[
                    styles.categoryItem,
                    scienceSearchCategories.includes(source.id) && styles.categoryItemSelected,
                  ]}
                  onPress={() => toggleScienceSearchCategory(source.id)}
                >
                  <Text
                    style={[
                      styles.categoryName,
                      scienceSearchCategories.includes(source.id) && styles.categoryNameSelected,
                    ]}
                  >
                    {source.name}
                  </Text>
                  {scienceSearchCategories.includes(source.id) && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
  },
  searchCategories: {
    marginTop: 12,
  },
  categoriesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryItemSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
  },
  categoryNameSelected: {
    color: 'white',
    fontWeight: '500',
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
