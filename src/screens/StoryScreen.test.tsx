import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StoryScreen } from '../screens/StoryScreen';

describe('StoryScreen Component', () => {
  test('renders correctly', () => {
    const { getByText } = render(<StoryScreen />);
    expect(getByText('故事天地')).toBeTruthy();
  });

  test('renders category buttons', () => {
    const { getByText } = render(<StoryScreen />);
    expect(getByText('童话故事')).toBeTruthy();
    expect(getByText('冒险故事')).toBeTruthy();
    expect(getByText('科普故事')).toBeTruthy();
    expect(getByText('动物故事')).toBeTruthy();
  });

  test('renders generate button', () => {
    const { getByText } = render(<StoryScreen />);
    expect(getByText('生成新故事')).toBeTruthy();
  });

  test('renders empty state when no stories', () => {
    const { getByText } = render(<StoryScreen />);
    expect(getByText('还没有故事')).toBeTruthy();
  });
});
