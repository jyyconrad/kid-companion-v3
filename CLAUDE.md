# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kid Companion is a React Native/Expo application designed as an AI-powered companion for children. It features an AI chat interface, story generation, and educational science content. The app integrates with AI services like OpenAI's GPT models.

## Architecture

The application follows a modern React Native architecture with:

- **State Management**: Zustand for global state management in `/src/store/`
- **Navigation**: React Navigation with bottom tabs and stack navigators in `/src/navigation/`
- **UI Components**: Reusable components in `/src/components/`
- **Screens**: Main application screens in `/src/screens/`
- **Services**: AI integration and business logic in `/src/services/`
- **Types**: TypeScript definitions in `/src/types/`

## Key Features

- **AI Chat Interface**: Real-time conversations with an AI assistant personalized for children
- **Story Generation**: Interactive stories with TTS (text-to-speech) playback
- **Science Knowledge**: Searchable educational content tailored for children
- **Personalized Experience**: Configurable AI personality and child profile

## Configuration System

The app uses a comprehensive configuration system stored in AsyncStorage:
- API configuration (endpoint, key)
- Model selection for different features
- Feature flags (voice, search)
- Personalized AI personality (name, chat style, interests, age)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on different platforms
npm run android    # Android device/emulator
npm run ios        # iOS simulator
npm run web        # Web browser

# Testing
npm test          # Run Jest tests
```

## Build Process

- Uses Expo for cross-platform development
- EAS Build configured for standalone APK generation
- Requires proper environment variables for AI API access
- Android minSdkVersion set to 24 (required by Expo SDK 54)

## Voice and Audio Features

- Implements speech recognition for voice input
- Text-to-speech for story narration
- Uses @react-native-voice/voice and expo-speech packages

## Important Notes

- The application is localized in Chinese
- Configuration happens through a wizard flow on first launch
- Uses AsyncStorage for persistent configuration
- Recent updates removed OTA update functionality in favor of standalone builds
- Removed react-native-worklets due to compatibility issues