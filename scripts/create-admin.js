/**
 * create-admin.js — Promueve un usuario existente en Firebase Auth a rol 'admin'
 *
 * Uso:
 *   npm run db:admin -- --email=admin@busnow.com
 *   npm run db:admin -- --uid=abc123def456
 *
 * El usuario debe haberse registrado primero en la app (debe existir
 * en Firebase Auth Y tener documento en la colección /users).
 */

'use strict';

const path = require('path');
const fs = require('fs');

// ─── Cargar .env ──────────────────────────────────────────────────────────────
const projectRoot = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌  No encontré .env');
    process.exit(1);
  }
  const env = {};
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    });
  return env;
}

const env = loadEnv();
const PROJECT_ID = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

if (!PROJECT_ID) {
  console.error('❌  EXPO_PUBLIC_FIREBASE_PROJECT_ID no está definido en .env');
  process.exit(1);
}

// ─── Argumentos CLI  ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(name) {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=') : null;
}

const targetEmail = getArg('email');
const targetUid = getArg('uid');

if (!targetEmail && !targetUid) {
  console.error('❌  Debes pasar --email=<email> o --uid=<uid>');
  console.error('   Ejemplo: npm run db:admin -- --email=admin@busnow.com');
  process.exit(1);
}

// ─── Firebase Admin ───────────────────────────────────────────────────────────
const admin = require(path.join(projectRoot, 'functions', 'node_modules', 'firebase-admin'));

function resolveCredentialPath() {
  const fromEnv = (env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '').trim();
  const adcPath = (process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();

  if (fromEnv) {
    const absolute = path.isAbsolute(fromEnv) ? fromEnv : path.join(projectRoot, fromEnv);
    if (!fs.existsSync(absolute)) {
      console.error(`❌  FIREBASE_SERVICE_ACCOUNT_PATH no existe: ${absolute}`);
      process.exit(1);
    }
    process.env.GOOGLE_APPLICATION_CREDENTIALS = absolute;
    return absolute;
  }

  if (adcPath && fs.existsSync(adcPath)) {
    return adcPath;
  }

  return null;
}

const credentialPath = resolveCredentialPath();

if (!admin.apps.length) {
  if (credentialPath) {
    const serviceAccount = require(credentialPath);
    admin.initializeApp({
      projectId: PROJECT_ID,
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({ projectId: PROJECT_ID });
  }
}

const db = admin.firestore();
const authAdmin = admin.auth();

// ─── Promover usuario ─────────────────────────────────────────────────────────
async function promoteToAdmin() {
  let uid = targetUid;
  let email = targetEmail;

  // Resolver UID a partir del email si no se pasó directo
  if (!uid && email) {
    try {
      const userRecord = await authAdmin.getUserByEmail(email);
      uid = userRecord.uid;
      console.log(`🔍  Usuario encontrado en Auth: ${uid} (${email})`);
    } catch (err) {
      console.error(`❌  No existe una cuenta con email "${email}" en Firebase Auth`);
      console.error('    Asegúrate de que el usuario se haya registrado primero en la app');
      process.exit(1);
    }
  }

  // Verificar que el documento de Firestore existe
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    console.error(`❌  No existe perfil de Firestore para uid="${uid}"`);
    console.error('    El usuario existe en Auth pero no completó el registro en la app');
    process.exit(1);
  }

  const currentData = userSnap.data();
  const currentRole = currentData.role;

  if (currentRole === 'admin') {
    console.log(`⚠️   El usuario ya tiene rol 'admin' — sin cambios`);
    return;
  }

  // Actualizar role en Firestore
  await userRef.set({ role: 'admin' }, { merge: true });

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Rol actualizado correctamente
    UID      : ${uid}
    Email    : ${currentData.email || email || '(sin email en perfil)'}
    Nombre   : ${currentData.name || '(sin nombre)'}
    Rol anterior : ${currentRole || 'null'}
    Rol nuevo    : admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El usuario debe cerrar sesión y volver a iniciar para que la app
reconozca el nuevo rol y lo redirija al panel de administración.
`);
}

promoteToAdmin().catch((err) => {
  if (String(err?.message || '').includes('Could not load the default credentials')) {
    console.error('');
    console.error('Sugerencias para autenticar Admin SDK:');
    console.error('1) Define FIREBASE_SERVICE_ACCOUNT_PATH en .env (ruta al JSON de service account).');
    console.error('2) O exporta GOOGLE_APPLICATION_CREDENTIALS con esa misma ruta.');
    console.error('3) En gcloud: gcloud auth application-default login');
    console.error('');
  }
  console.error('❌  Error:', err.message || err);
  process.exit(1);
});
