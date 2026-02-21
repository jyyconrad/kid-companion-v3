import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppConfig } from '../store/useAppConfig';

interface PersonaEditScreenProps {
  // Props from navigation
}

const CHAT_STYLES = ['温柔姐姐', '幽默哥哥', '知识渊博的老师', '探险家朋友'];
const INTERESTS_TAGS = [
  '动物',
  '宇宙',
  '植物',
  '历史',
  '科学实验',
  '数学趣味',
  '自然',
  '地理探险',
];

export const PersonaEditScreen: React.FC<PersonaEditScreenProps> = (props) => {
  const config = useAppConfig();
  const [aiName, setAiName] = useState(config.persona.aiName);
  const [chatStyle, setChatStyle] = useState(config.persona.chatStyle);
  const [childAge, setChildAge] = useState(config.persona.childAge.toString());
  const [interests, setInterests] = useState<string[]>(config.persona.interests);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      return [...prev, interest];
    });
  };

  const handleSave = () => {
    if (!aiName) {
      alert('请输入AI角色名称');
      return;
    }

    config.updateConfig({
      persona: {
        aiName,
        chatStyle,
        interests,
        childAge: parseInt(childAge) || 6,
        isInitialized: true,
      },
    });
    config.saveConfig();
    alert('保存成功');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.label}>AI角色名称</Text>
          <TextInput
            style={styles.input}
            value={aiName}
            onChangeText={setAiName}
            placeholder="例如：小伴童"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>聊天风格</Text>
          <View style={styles.tagsContainer}>
            {CHAT_STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.tag,
                  chatStyle === style && styles.tagSelected,
                ]}
                onPress={() => setChatStyle(style)}
              >
                <Text
                  style={[
                    styles.tagText,
                    chatStyle === style && styles.tagTextSelected,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>孩子年龄</Text>
          <TextInput
            style={styles.input}
            value={childAge}
            onChangeText={setChildAge}
            placeholder="6"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>兴趣标签（多选）</Text>
          <View style={styles.tagsContainer}>
            {INTERESTS_TAGS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  interests.includes(interest) && styles.tagSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.tagText,
                    interests.includes(interest) && styles.tagTextSelected,
                  ]}
                >
                  {interest}
                </Text>
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  tagTextSelected: {
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
