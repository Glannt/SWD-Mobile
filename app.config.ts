import { ConfigContext, ExpoConfig } from 'expo/config';

// Đọc app.json và thêm cấu hình bổ sung
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SWD-Mobile',
  slug: 'SWD-Mobile',
  scheme: 'swdmobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    ...(config.ios || {}),
    bundleIdentifier: 'com.anonymous.SWDMobile',
    supportsTablet: true,
  },
  android: {
    ...(config.android || {}),
    package: 'com.anonymous.SWDMobile',
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    ['expo-notifications', {
      icon: './assets/notification-icon.png',
      color: '#ffffff'
    }],
    'expo-web-browser'
  ],
  extra: {
    ...(config.extra || {}),
    eas: {
      projectId: 'your-project-id', // Điền project ID của bạn
    },
  },
  experiments: {
    typedRoutes: true,
  },
}); 