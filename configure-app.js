// 🔧 Configurador automático de app.json para BusNow
// Lee variables de .env y actualiza app.json dinámicamente

const fs = require('fs');
const path = require('path');

// Función para cargar .env manualmente
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: Archivo .env no encontrado');
    console.log('💡 Copia .env.example a .env y configura tus variables');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !line.startsWith('#')) {
      env[key.trim()] = value.trim();
    }
  });
  
  return env;
}

console.log('🔧 Configurando app.json con variables de entorno...');

try {
  // Cargar variables de entorno
  const env = loadEnv();
  
  // Verificar que PROJECT_ID existe
  if (!env.EXPO_PUBLIC_PROJECT_ID) {
    console.error('❌ Error: EXPO_PUBLIC_PROJECT_ID no está definido en .env');
    process.exit(1);
  }
  
  console.log(`✅ PROJECT_ID encontrado: ${env.EXPO_PUBLIC_PROJECT_ID}`);
  
  // Leer app.json
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Hacer backup
  fs.writeFileSync(appJsonPath + '.backup', JSON.stringify(appJson, null, 2));
  
  // Actualizar PROJECT_ID
  if (!appJson.expo.extra) {
    appJson.expo.extra = {};
  }
  if (!appJson.expo.extra.eas) {
    appJson.expo.extra.eas = {};
  }
  
  appJson.expo.extra.eas.projectId = env.EXPO_PUBLIC_PROJECT_ID;
  
  // También actualizar Google Maps API Keys si están disponibles
  if (env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID) {
    appJson.expo.android.config.googleMaps.apiKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
  }
  
  if (env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS) {
    appJson.expo.ios.config.googleMapsApiKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS;
  }
  
  // Guardar app.json actualizado
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  
  console.log('✅ app.json actualizado exitosamente');
  console.log(`📱 Project ID: ${env.EXPO_PUBLIC_PROJECT_ID}`);
  
  if (env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID) {
    console.log('🗺️ Google Maps Android API Key configurado');
  }
  
  if (env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS) {
    console.log('🗺️ Google Maps iOS API Key configurado');
  }
  
  console.log('🎉 Configuración completa! app.json listo para EAS');
  
  // Limpiar backup
  fs.unlinkSync(appJsonPath + '.backup');
  
} catch (error) {
  console.error('❌ Error durante la configuración:', error.message);
  
  // Restaurar backup si existe
  const backupPath = path.join(__dirname, 'app.json.backup');
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, path.join(__dirname, 'app.json'));
    fs.unlinkSync(backupPath);
    console.log('🔄 app.json restaurado desde backup');
  }
  
  process.exit(1);
}
