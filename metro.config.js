const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = mergeConfig(defaultConfig, {
  resolver: {
    assetExts: [...assetExts, 'onnx', 'webm', 'json'],
    sourceExts,
  },
});

module.exports = withNativeWind(config, { input: './app.css' });
