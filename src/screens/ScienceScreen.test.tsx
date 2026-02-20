import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ScienceScreen } from '../screens/ScienceScreen';

describe('ScienceScreen Component', () => {
  test('renders correctly', () => {
    const { getByText } = render(<ScienceScreen />);
    expect(getByText('科学知识')).toBeTruthy();
  });

  test('renders search input', () => {
    const { getByPlaceholderText } = render(<ScienceScreen />);
    expect(getByPlaceholderText('搜索科学知识...')).toBeTruthy();
  });

  test('renders category buttons', () => {
    const { getByText } = render(<ScienceScreen />);
    expect(getByText('全部')).toBeTruthy();
    expect(getByText('动物世界')).toBeTruthy();
    expect(getByText('植物王国')).toBeTruthy();
    expect(getByText('太空探索')).toBeTruthy();
    expect(getByText('人体奥秘')).toBeTruthy();
    expect(getByText('物理百科')).toBeTruthy();
    expect(getByText('化学天地')).toBeTruthy();
  });

  test('renders empty state when no knowledges', () => {
    const { getByText } = render(<ScienceScreen />);
    expect(getByText('还没有知识卡片')).toBeTruthy();
  });
});
