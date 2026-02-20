import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleSubmitEditing = () => {
    handleSend();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder="和AI聊天..."
          placeholderTextColor="#999"
          editable={!disabled}
          multiline
          maxLength={500}
          textAlignVertical="center"
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="send"
        />
      </View>
      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Ionicons
          name="send"
          size={20}
          color={text.trim() && !disabled ? 'white' : '#999'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'center',
    minHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
});
