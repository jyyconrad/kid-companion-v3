import { useState, useCallback, useRef, useEffect } from 'react';
import * as SpeechRecognition from 'expo-speech-recognition';

export interface VoiceRecognitionOptions {
  language?: string;
  partialResults?: boolean;
  maxDuration?: number;
}

export interface VoiceRecognitionResult {
  text: string;
  isFinal: boolean;
}

export function useVoiceRecognition(options: VoiceRecognitionOptions = {}, configLanguage?: string) {
  const {
    language = configLanguage || 'zh-CN',
    partialResults = true,
    maxDuration = 30
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');

      const { status } = await SpeechRecognition.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission denied');
      }

      setIsListening(true);

      await SpeechRecognition.startListening({
        language,
        partialResults,
        onResult: (event) => {
          if (event.results && event.results.length > 0) {
            setTranscript(event.results[0].transcript);
          }
        },
        onError: (err) => {
          setError(new Error(err.message));
          setIsListening(false);
        }
      });

      // Set timeout
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, maxDuration * 1000);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsListening(false);
    }
  }, [language, partialResults, maxDuration, cleanup]);

  const stopListening = useCallback(async () => {
    try {
      cleanup();
      await SpeechRecognition.stopListening();
      setIsListening(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to stop listening'));
    }
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
      if (isListening) {
        SpeechRecognition.stopListening().catch(() => {});
      }
    };
  }, [cleanup, isListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
}

export default useVoiceRecognition;
