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
    package: "com.anonymous.kidcompanionv3"
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
    eas: {}
  }
});
