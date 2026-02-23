// @ts-check

/**
 * @type {import('expo').ConfigFunction}
 */
export default () => ({
  name: "kid-companion-jyy",
  slug: "kid-companion-jyy",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
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
    versionCode: 1
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro"
  },
  plugins: [
    "expo-router",
    "expo-font"
  ],
  extra: {
    router: {},
    eas: {
      projectId: "9b5b723a-f716-4531-a2dd-5415177e41bd"
    }
  }
});
