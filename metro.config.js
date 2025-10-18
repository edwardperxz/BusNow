// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuración para resolver el problema con react-native-maps en web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configuración específica para plataforma web ya no es necesaria
// Ahora usamos importación condicional en el código directamente

module.exports = config;
