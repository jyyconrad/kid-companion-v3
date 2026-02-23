import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  inputRef?: React.RefObject<TextInput>;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false, inputRef, value, onChangeText }) => {
  const [internalText, setInternalText] = useState('');
  const text = value !== undefined ? value : internalText;
  const setText = onChangeText || setInternalText;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputInternalRef = useRef<TextInput>(null);
  const activeInputRef = inputRef || inputInternalRef;

  // 监听键盘高度变化
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      // 收起键盘
      Keyboard.dismiss();
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleSubmitEditing = () => {
    handleSend();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={activeInputRef}
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
            blurOnSubmit
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    backgroundColor: 'white',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'center',
    minHeight: 20,
    maxHeight: Platform.OS === 'ios' ? 80 : 120, // iOS上限制高度，Android上允许更高
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
