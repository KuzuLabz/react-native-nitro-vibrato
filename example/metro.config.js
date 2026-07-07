const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const root = path.resolve(__dirname, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// config.watchFolders.push(root);

config.resolver.assetExts.push('wasm', 'dic', 'zst', 'def', 'csv');

// 1. Watch all files within the monorepo
config.watchFolders = [root];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(root, 'node_modules'),
];

module.exports = config;