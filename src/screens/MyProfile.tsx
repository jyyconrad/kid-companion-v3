import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MyProfileProps {
  // Props from navigation
}

export const MyProfile: React.FC<MyProfileProps> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionTitle}>配置中心</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionTitle}>AI人设</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionTitle}>其他</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
    marginTop: 8,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
