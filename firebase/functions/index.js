const functions = require('firebase-functions');
const axios = require('axios');

// Cloud Function HTTPS callable para calcular ETA usando Google Directions API
// Payload esperado: { busLocation: { latitude, longitude }, stopLocation: { latitude, longitude } }
exports.calculateETA = functions.https.onCall(async (data, context) => {
  try {
    const { busLocation, stopLocation } = data || {};

    if (!busLocation || !stopLocation) {
      throw new functions.https.HttpsError('invalid-argument', 'busLocation y stopLocation son requeridos');
    }

    const origin = `${busLocation.latitude},${busLocation.longitude}`;
    const destination = `${stopLocation.latitude},${stopLocation.longitude}`;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || (functions.config().maps && functions.config().maps.key) || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'Falta GOOGLE_MAPS_API_KEY en las funciones');
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    const params = {
      origin,
      destination,
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
      language: 'es',
      region: 'pa',
      key: apiKey
    };

    const response = await axios.get(url, { params });

    if (response.data.status !== 'OK') {
      throw new functions.https.HttpsError('failed-precondition', `Google API error: ${response.data.status}`);
    }

    const route = response.data.routes?.[0];
    const leg = route?.legs?.[0];

    const result = {
      durationSeconds: leg?.duration_in_traffic?.value || leg?.duration?.value || 0,
      durationText: leg?.duration_in_traffic?.text || leg?.duration?.text || '',
      distanceMeters: leg?.distance?.value || 0,
      distanceText: leg?.distance?.text || '',
      polyline: route?.overview_polyline?.points || '',
      startAddress: leg?.start_address || '',
      endAddress: leg?.end_address || ''
    };

    return { ok: true, eta: result, calculatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('calculateETA error:', err?.message || err);
    throw new functions.https.HttpsError('internal', err?.message || 'Error calculando ETA');
  }
});
