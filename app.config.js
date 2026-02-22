// @ts-check

/**
 * @type {import('expo').ConfigFunction}
 */
export default () => ({
  name: "kid-companion-v3",
  slug: "kid-companion-v3",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.kidcompanionv3"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.anonymous.kidcompanionv3",
    minSdkVersion: 24
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro"
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "@react-native-voice/voice",
      {
        "microphonePermission": "允许 $(PRODUCT_NAME) 使用麦克风进行语音输入",
        "speechRecognitionPermission": "允许 $(PRODUCT_NAME) 使用语音识别功能"
      }
    ]
  ],
  extra: {
    router: {},
    eas: {
      projectId: "6a820012-a4e6-46de-b580-fd84d252f379"
    }
  }
});
