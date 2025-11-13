// Script para inicializar códigos de conductor en Firestore
// Ejecutar: node scripts/initDriverCodes.js

const admin = require('firebase-admin');

// IMPORTANTE: Descarga tu Service Account Key desde Firebase Console
// Proyecto Settings → Service Accounts → Generate new private key
// Guárdalo como serviceAccountKey.json en la raíz del proyecto
// NO subas este archivo a Git (ya está en .gitignore)

try {
  const serviceAccount = require('../serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  console.error('Por favor descarga el Service Account Key desde Firebase Console');
  console.error('Proyecto Settings → Service Accounts → Generate new private key');
  process.exit(1);
}

const db = admin.firestore();

// Códigos de conductor de ejemplo
const driverCodes = [
  {
    employeeId: "EMP-2024-001",
    company: "TransportesPTY",
    licenseNumber: "PA-1234567",
    busNumber: "15A",
    route: "Albrook - Costa del Este",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    employeeId: "EMP-2024-002",
    company: "MetroBus",
    licenseNumber: "PA-7654321",
    busNumber: "23B",
    route: "Corredor Norte",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    employeeId: "RBUS-301",
    company: "RápidoBus",
    licenseNumber: "PA-9876543",
    busNumber: "07",
    route: "Express Tocumen",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    employeeId: "URB-E-205",
    company: "Urbanos del Este",
    licenseNumber: "PA-5551234",
    busNumber: "42",
    route: "Don Bosco - San Francisco",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    employeeId: "TEST-001",
    company: "TransportesDemo",
    licenseNumber: "PA-0000001",
    busNumber: "99",
    route: "Ruta de Prueba",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  // Código personalizado para Edward Perez
  {
    employeeId: "ADMIN-001",
    company: "BusNowAdmin",
    licenseNumber: "PA-ADMIN01",
    busNumber: "01",
    route: "Todas las Rutas",
    isActive: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  // Código desactivado para testing
  {
    employeeId: "EMP-2023-999",
    company: "TransportesPTY",
    licenseNumber: "PA-9999999",
    busNumber: "99X",
    route: "Ruta Inactiva",
    isActive: false,
    createdAt: admin.firestore.Timestamp.now()
  }
];

async function initCodes() {
  console.log('🚀 Iniciando carga de códigos de conductor...\n');
  
  try {
    const batch = db.batch();
    
    driverCodes.forEach(code => {
      const docRef = db.collection('driverCodes').doc(code.employeeId);
      batch.set(docRef, code);
      console.log(`✓ ${code.employeeId} - ${code.company} - Bus ${code.busNumber}`);
    });
    
    await batch.commit();
    
    console.log('\n✅ ¡Todos los códigos fueron agregados exitosamente!');
    console.log(`\n📊 Total de códigos: ${driverCodes.length}`);
    console.log(`   - Activos: ${driverCodes.filter(c => c.isActive).length}`);
    console.log(`   - Inactivos: ${driverCodes.filter(c => !c.isActive).length}`);
    
    console.log('\n🧪 Códigos de prueba:');
    console.log('   Código: EMP-2024-001');
    console.log('   Empresa: TransportesPTY');
    console.log('   Licencia: PA-1234567');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar códigos:', error);
    process.exit(1);
  }
}

// Ejecutar
initCodes();
