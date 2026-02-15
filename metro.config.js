const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const treeViewPath = path.resolve(__dirname, '../kintales-tree-view');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve the local @kintales/tree-view symlink
config.watchFolders = [treeViewPath];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });
