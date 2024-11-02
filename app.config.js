const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  name: IS_DEV ? "AudioScape (Dev)" : "AudioScape",
  slug: "AudioScape",
  version: "1.3.0",
  platforms: ["android"],
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: IS_DEV ? "audioscape-dev" : "audioscape",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1A1A1A"
  },
  android: {
    softwareKeyboardLayoutMode: "pan",
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.MANAGE_EXTERNAL_STORAGE",
      "android.permission.FOREGROUND_SERVICE"
    ],
    icon: "./assets/images/icon.png",
    package: IS_DEV ? "com.ankushsarkar.audioscape.dev" : "com.ankushsarkar.audioscape",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon-foreground.png",
      backgroundImage: "./assets/images/adaptive-icon-background.png"
    },
    backgroundColor: "#1A1A1A"
  },
  androidNavigationBar: {
    backgroundColor: "#1A1A1A"
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