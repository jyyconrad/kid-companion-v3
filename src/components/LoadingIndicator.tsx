import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingIndicatorProps {
  text?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text = 'AI正在思考中...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#4A90E2" style={styles.indicator} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicator: {
    marginRight: 12,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
