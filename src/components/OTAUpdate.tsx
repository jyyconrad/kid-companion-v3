import React, { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

interface OTAUpdateProps {
  checkInterval?: number; // 检查间隔（毫秒），默认5分钟
  autoUpdate?: boolean; // 是否自动更新，默认true
}

/**
 * OTA 自动更新组件
 * 检查并应用应用内更新
 */
export const OTAUpdate: React.FC<OTAUpdateProps> = ({
  checkInterval = 5 * 60 * 1000, // 默认5分钟
  autoUpdate = true,
}) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 首次检查
    checkForUpdates();

    // 定期检查
    const interval = setInterval(checkForUpdates, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('[OTA] 发现新版本');
        setIsUpdateAvailable(true);

        if (autoUpdate) {
          applyUpdate();
        } else {
          showUpdateAlert();
        }
      }
    } catch (error) {
      console.log('[OTA] 检查更新失败:', error);
    }
  };

  const showUpdateAlert = () => {
    Alert.alert(
      '发现新版本',
      '应用有新版本可用，是否立即更新？',
      [
        {
          text: '稍后',
          style: 'cancel',
        },
        {
          text: '立即更新',
          onPress: applyUpdate,
        },
      ]
    );
  };

  const applyUpdate = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      console.log('[OTA] 开始下载更新...');

      // 下载并应用更新
      await Updates.fetchUpdateAsync();

      console.log('[OTA] 更新下载完成，重启应用...');
      Updates.reloadAsync();
    } catch (error) {
      console.error('[OTA] 更新失败:', error);
      Alert.alert('更新失败', '更新过程中出现错误，请稍后重试');
      setIsUpdating(false);
    }
  };

  return null; // 后台运行，不渲染任何内容
};

/**
 * 手动检查更新的Hook
 */
export const useManualUpdate = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  const check = async () => {
    setIsChecking(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      setIsUpdateAvailable(update.isAvailable);
      return update.isAvailable;
    } catch (error) {
      console.error('[OTA] 手动检查失败:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const apply = async () => {
    try {
      await Updates.fetchUpdateAsync();
      Updates.reloadAsync();
    } catch (error) {
      console.error('[OTA] 应用更新失败:', error);
      throw false;
    }
  };

  return { isChecking, isUpdateAvailable, check, apply };
};

export default OTAUpdate;
