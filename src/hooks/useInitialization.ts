import { useEffect, useState } from 'react';
import { useAppConfig } from '../store/useAppConfig';

export interface InitializationState {
  isLoading: boolean;
  isInitialized: boolean;
  needsSetup: boolean;
}

export const useInitialization = (): InitializationState => {
  const config = useAppConfig();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);

        // 加载配置
        await config.loadConfig();

        // 检查是否已完成初始化
        const initialized =
          config.persona.isInitialized &&
          config.apiKey.length > 0 &&
          config.apiUrl.length > 0;

        setIsInitialized(initialized);
        setNeedsSetup(!initialized);
      } catch (error) {
        console.error('Initialization error:', error);
        setNeedsSetup(true);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [config]);

  return {
    isLoading,
    isInitialized,
    needsSetup,
  };
};
