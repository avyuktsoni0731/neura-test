const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {
  // Your existing Metro configuration
});

module.exports = withNativeWind(config, { input: './app.css' });
