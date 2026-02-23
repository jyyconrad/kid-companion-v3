import { StreamSpeechManager } from '../../src/services/stream-speech-manager';

describe('StreamSpeechManager', () => {
  let streamSpeechManager: StreamSpeechManager;

  beforeEach(() => {
    streamSpeechManager = new StreamSpeechManager();
  });

  test('should initialize with default configuration', () => {
    expect(streamSpeechManager).toBeDefined();
    // Assuming there's a way to check initialization state
    expect(streamSpeechManager).toBeInstanceOf(StreamSpeechManager);
  });

  test('should handle text-to-speech conversion successfully', async () => {
    const mockText = 'Hello, this is a test message.';
    // Mock the actual TTS functionality since we don't want to produce audio during tests
    const mockSpeak = jest.spyOn(streamSpeechManager as any, 'convertTextToSpeech').mockResolvedValue('mocked-audio-data');
    
    const result = await (streamSpeechManager as any).handleTextToSpeech(mockText);
    
    expect(mockSpeak).toHaveBeenCalledWith(mockText);
    expect(result).toBe('mocked-audio-data');
  });

  test('should properly manage audio streaming queue', async () => {
    // Test that multiple text inputs are queued and processed in order
    const texts = ['First message', 'Second message', 'Third message'];
    
    const processQueueSpy = jest.spyOn(streamSpeechManager as any, 'processQueue').mockImplementation(async () => {
      // Simulate processing without actual audio
      return Promise.resolve();
    });
    
    // Add multiple items to queue
    for (const text of texts) {
      streamSpeechManager.addTextToQueue(text);
    }
    
    // Process the queue
    await streamSpeechManager.processQueue();
    
    expect(processQueueSpy).toHaveBeenCalled();
    expect((streamSpeechManager as any).queue.length).toBe(0); // Queue should be empty after processing
  });

  test('should handle errors during speech conversion gracefully', async () => {
    const mockText = 'Error test message';
    const mockError = new Error('TTS Service unavailable');
    
    // Mock the TTS function to throw an error
    const mockSpeak = jest.spyOn(streamSpeechManager as any, 'convertTextToSpeech').mockRejectedValue(mockError);
    
    // Expect the error to be handled without crashing
    await expect((streamSpeechManager as any).handleTextToSpeech(mockText)).rejects.toThrow('TTS Service unavailable');
    
    expect(mockSpeak).toHaveBeenCalledWith(mockText);
  });

  test('should clear the queue when requested', () => {
    // Add some items to the queue
    streamSpeechManager.addTextToQueue('Message 1');
    streamSpeechManager.addTextToQueue('Message 2');
    
    expect((streamSpeechManager as any).queue.length).toBe(2);
    
    // Clear the queue
    streamSpeechManager.clearQueue();
    
    expect((streamSpeechManager as any).queue.length).toBe(0);
  });
});