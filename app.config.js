const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  name: IS_DEV ? "AudioScape (Dev)" : "AudioScape",
  slug: "AudioScape",
  version: "1.2.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: IS_DEV ? "audioscape-dev" : "audioscape",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#252525"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV ? "com.ankushsarkar.audioscape.dev" : "com.ankushsarkar.audioscape",
  },
  android: {
    permissions: [
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "FOREGROUND_SERVICE"
    ],
    icon: "./assets/images/icon.png",
    package: IS_DEV ? "com.ankushsarkar.audioscape.dev" : "com.ankushsarkar.audioscape",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon-foreground.png",
      backgroundImage: "./assets/images/adaptive-icon-background.png"
    },
    backgroundColor: "#252525"
  },
  androidNavigationBar: {
    backgroundColor: "#252525"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "5b2ff856-818a-42fc-b589-5287fa676098"
    }
  }
}