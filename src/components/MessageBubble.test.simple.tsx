import React from 'react';
import { MessageBubble, Message } from '../components/MessageBubble';
import renderer from 'react-test-renderer';

describe('MessageBubble Component', () => {
  const mockUserMessage: Message = {
    id: '1',
    type: 'user',
    content: '你好，我是用户！',
    timestamp: new Date(),
  };

  const mockAIMessage: Message = {
    id: '2',
    type: 'ai',
    content: '你好！我是AI助手。',
    timestamp: new Date(),
  };

  test('renders user message correctly', () => {
    const tree = renderer.create(<MessageBubble message={mockUserMessage} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders AI message correctly', () => {
    const tree = renderer.create(<MessageBubble message={mockAIMessage} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders with correct content', () => {
    const tree = renderer.create(<MessageBubble message={mockUserMessage} />).toJSON();
    expect(tree).toBeTruthy();
  });
});
