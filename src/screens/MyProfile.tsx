import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppConfig } from '../store/useAppConfig';

type RootStackParamList = {
  MyProfile: undefined;
  ApiConfigScreen: undefined;
  ModelSelectScreen: undefined;
  FeatureConfigScreen: undefined;
  PersonaEditScreen: undefined;
  PersonaGuideScreen: undefined;
};

type MyProfileProps = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

export const MyProfile: React.FC<MyProfileProps> = ({ navigation }) => {
  const config = useAppConfig();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的</Text>
        {config.persona.aiName && (
          <Text style={styles.aiName}>{config.persona.aiName}</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.groupTitle}>配置中心</Text>

        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('ApiConfigScreen')}
        >
          <View style={styles.sectionLeft}>
            <Ionicons name="key" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>API配置</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('ModelSelectScreen')}
        >
          <View style={styles.sectionLeft}>
            <Ionicons name="cube" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>模型设置</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('FeatureConfigScreen')}
        >
          <View style={styles.sectionLeft}>
            <Ionicons name="settings" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>功能配置</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.groupTitle}>AI人设</Text>

        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('PersonaGuideScreen')}
        >
          <View style={styles.sectionLeft}>
            <Ionicons name="sparkles" size={24} color="#4A90E2" />
            <View>
              <Text style={styles.sectionTitle}>角色配置</Text>
              <Text style={styles.sectionSubtitle}>
                一步步引导生成专属AI
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('PersonaEditScreen')}
        >
          <View style={styles.sectionLeft}>
            <Ionicons name="person-circle" size={24} color="#4A90E2" />
            <View>
              <Text style={styles.sectionTitle}>AI角色设置</Text>
              <Text style={styles.sectionSubtitle}>
                {config.persona.chatStyle} · {config.persona.childAge}岁
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  aiName: {
    fontSize: 16,
    color: '#4A90E2',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
});
