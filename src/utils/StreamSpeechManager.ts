/**
 * 流式语音管理器
 * 
 * 解决流式输出与语音播放的无缝结合问题：
 * 1. 边接收 AI 回复边播放语音（不需要等完整回复）
 * 2. 智能分句播放（按标点符号分割）
 * 3. 避免重复播放（已播放的不再播放）
 * 4. 支持中断（用户发送新消息时停止播放）
 * 
 * 工作流程：
 * AI 流式输出 → 累积文本 → 检测完整句子 → 播放语音 → 标记已播放
 */

import * as Speech from 'expo-speech';

interface StreamSpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  onSentenceStart?: (sentence: string) => void;
  onSentenceEnd?: (sentence: string) => void;
  onComplete?: (fullText: string) => void;
}

export class StreamSpeechManager {
  private buffer: string = '';           // 累积的文本
  private playedLength: number = 0;      // 已播放的字符数
  private isPlaying: boolean = false;    // 是否正在播放
  private queue: string[] = [];          // 待播放的句子队列
  private options: StreamSpeechOptions;
  private isComplete: boolean = false;   // 流式输出是否完成

  constructor(options: StreamSpeechOptions = {}) {
    this.options = {
      language: 'zh-CN',
      pitch: 1.0,
      rate: 0.9,
      ...options,
    };
  }

  /**
   * 添加流式文本片段
   * 每次 AI 输出一个 chunk 时调用
   */
  addChunk(chunk: string) {
    this.buffer += chunk;
    this.processBuffer();
  }

  /**
   * 标记流式输出完成
   * 播放剩余的文本
   */
  markComplete() {
    this.isComplete = true;
    this.processBuffer(true); // 强制播放剩余内容
  }

  /**
   * 停止播放
   * 清空队列和缓冲区
   */
  async stop() {
    this.queue = [];
    this.buffer = '';
    this.playedLength = 0;
    this.isComplete = false;
    
    if (this.isPlaying) {
      await Speech.stop();
      this.isPlaying = false;
    }
  }

  /**
   * 重置管理器
   * 用于开始新的对话
   */
  reset() {
    this.stop();
    this.playedLength = 0;
    this.isComplete = false;
  }

  /**
   * 处理缓冲区
   * 检测是否有完整的句子可以播放
   */
  private processBuffer(force: boolean = false) {
    const unplayedText = this.buffer.slice(this.playedLength);
    
    // 中文句子分割标点
    const sentenceEndings = /[。！？!?\.]/;
    
    // 查找最后一个句子结束位置
    let lastEndingIndex = -1;
    for (let i = unplayedText.length - 1; i >= 0; i--) {
      if (sentenceEndings.test(unplayedText[i])) {
        lastEndingIndex = i;
        break;
      }
    }

    // 如果有完整句子，或者强制播放（流式完成）
    if (lastEndingIndex >= 0 || (force && unplayedText.length > 0)) {
      const endIndex = lastEndingIndex >= 0 ? lastEndingIndex + 1 : unplayedText.length;
      const sentence = unplayedText.slice(0, endIndex);
      
      if (sentence.trim().length > 0) {
        this.queue.push(sentence);
        this.playNextInQueue();
      }
      
      // 更新已播放长度
      this.playedLength += endIndex;
    }
  }

  /**
   * 播放队列中的下一个句子
   */
  private async playNextInQueue() {
    if (this.queue.length === 0 || this.isPlaying) {
      return;
    }

    const sentence = this.queue.shift()!;
    this.isPlaying = true;

    try {
      this.options.onSentenceStart?.(sentence);

      await Speech.speak(sentence, {
        language: this.options.language,
        pitch: this.options.pitch,
        rate: this.options.rate,
        onDone: () => {
          this.isPlaying = false;
          this.options.onSentenceEnd?.(sentence);
          
          // 播放下一个句子
          if (this.queue.length > 0) {
            this.playNextInQueue();
          } else if (this.isComplete && this.buffer.length > this.playedLength) {
            // 流式完成但还有剩余文本
            this.processBuffer(true);
          } else if (this.isComplete) {
            // 全部完成
            this.options.onComplete?.(this.buffer);
          }
        },
        onError: (error) => {
          console.error('语音播放失败:', error);
          this.isPlaying = false;
          this.playNextInQueue();
        },
      });
    } catch (error) {
      console.error('语音播放异常:', error);
      this.isPlaying = false;
      this.playNextInQueue();
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      bufferLength: this.buffer.length,
      playedLength: this.playedLength,
      queueLength: this.queue.length,
      isPlaying: this.isPlaying,
      isComplete: this.isComplete,
    };
  }
}

/**
 * 创建流式语音管理器实例
 * 
 * 使用示例：
 * 
 * const speechManager = createStreamSpeechManager({
 *   onSentenceStart: (sentence) => {
 *     console.log('开始播放:', sentence);
 *   },
 *   onComplete: (fullText) => {
 *     console.log('播放完成:', fullText);
 *   }
 * });
 * 
 * // 流式输出时
 * for await (const chunk of result.textStream) {
 *   speechManager.addChunk(chunk);
 *   // 更新 UI 显示
 * }
 * 
 * // 流式完成后
 * speechManager.markComplete();
 */
export const createStreamSpeechManager = (options?: StreamSpeechOptions) => {
  return new StreamSpeechManager(options);
};
