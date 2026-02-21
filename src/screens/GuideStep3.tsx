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

interface GuideStep3Props {
  onNext: () => void;
  onBack: () => void;
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

export const GuideStep3: React.FC<GuideStep3Props> = ({ onNext, onBack }) => {
  const config = useAppConfig();
  const [aiName, setAiName] = useState('小伴童');
  const [chatStyle, setChatStyle] = useState('温柔姐姐');
  const [childAge, setChildAge] = useState('6');
  const [interests, setInterests] = useState<string[]>(['']);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      return [...prev, interest];
    });
  };

  const handleNext = () => {
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
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.step}>步骤 3/3</Text>
        <Text style={styles.title}>设置AI人设</Text>
        <Text style={styles.description}>
          帮助{aiName}更好地了解孩子
        </Text>

        <ScrollView>
          <View style={styles.field}>
            <Text style={styles.label}>AI角色名称</Text>
            <TextInput
              style={styles.input}
              value={aiName}
              onChangeText={setAiName}
              placeholder="例如：小伴童"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.field}>
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

          <View style={styles.field}>
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

          <View style={styles.field}>
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
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>上一步</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>完成设置</Text>
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
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
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
