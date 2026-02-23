/**
 * UI 动画工具函数
 * 
 * 提供流式输出、语音播放、消息列表的动画效果
 */

import { Easing } from 'react-native';

/**
 * 打字机效果配置
 */
export const typewriterConfig = {
  duration: 50,  // 每个字符的显示间隔 (ms)
  easing: Easing.linear,
};

/**
 * 语音播放动画配置
 */
export const voiceAnimationConfig = {
  waveCount: 3,  // 波形数量
  waveHeight: 20,  // 波形高度
  duration: 600,  // 波形动画周期 (ms)
};

/**
 * 消息列表动画配置
 */
export const listAnimationConfig = {
  springDamping: 0.8,
  springMass: 1,
  initialVelocity: 0,
};

/**
 * 计算流式输出的进度
 */
export const calculateTypewriterProgress = (
  currentLength: number,
  totalLength: number
): number => {
  if (totalLength === 0) return 0;
  return Math.min(currentLength / totalLength, 1);
};

/**
 * 生成波形动画数据
 */
export const generateWaveAnimation = (
  isPlaying: boolean,
  time: number
): number[] => {
  if (!isPlaying) return [0, 0, 0];
  
  return [0, 1, 2].map(i => {
    const offset = (i * Math.PI * 2) / 3;
    return Math.sin(time * 0.005 + offset) * voiceAnimationConfig.waveHeight;
  });
};

/**
 * 平滑滚动到底部
 */
export const smoothScrollToEnd = (
  currentOffset: number,
  targetOffset: number,
  duration: number = 300
): number => {
  const distance = targetOffset - currentOffset;
  return currentOffset + distance * 0.3;  // 缓动系数
};

/**
 * 消息进入动画
 */
export const getMessageEnterStyle = (index: number) => {
  return {
    opacity: 0,
    transform: [{ translateY: 20 }],
    animation: {
      toValue: {
        opacity: 1,
        transform: [{ translateY: 0 }],
      },
      duration: 300,
      delay: index * 50,
      easing: Easing.out(Easing.cubic),
    },
  };
};

/**
 * 语音播放按钮脉冲动画
 */
export const getPulseAnimation = (isPlaying: boolean) => {
  if (!isPlaying) {
    return {
      scale: 1,
      opacity: 1,
    };
  }
  
  return {
    scale: 1.1,
    opacity: 0.8,
    animation: {
      toValue: {
        scale: 1,
        opacity: 1,
      },
      duration: 1000,
      easing: Easing.inOut(Easing.sin),
      loop: true,
    },
  };
};
