import '@testing-library/react-native/extend-expect';

// 全局 mock
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn(),
}));

jest.mock('ai', () => ({
  generateText: jest.fn(),
}));
