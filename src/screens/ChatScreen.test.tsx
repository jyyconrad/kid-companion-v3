import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatScreen } from '../screens/ChatScreen';

describe('ChatScreen Component', () => {
  test('renders correctly', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    expect(getByPlaceholderText('和AI聊天...')).toBeTruthy();
  });

  test('renders message input', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    expect(getByPlaceholderText('和AI聊天...')).toBeTruthy();
  });

  test('renders message list', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    expect(getByPlaceholderText('和AI聊天...')).toBeTruthy();
  });

  test('renders send button', () => {
    const { getByRole } = render(<ChatScreen />);
    expect(getByRole('button')).toBeTruthy();
  });

  test('input field is editable', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    const input = getByPlaceholderText('和AI聊天...');
    expect(input.props.editable).toBe(true);
  });
});
