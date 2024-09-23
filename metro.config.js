const { getDefaultConfig } = require('expo/metro-config');
const { dirname } = require('path');

const config = getDefaultConfig(dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts.push('d.ts');

module.exports = config;
