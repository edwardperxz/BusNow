/**
 * route-geometry.ts
 *
 * Genera el trazado real de una ruta de bus llamando a OSRM con los puntos
 * de ancla como waypoints. Devuelve un Google-Encoded Polyline completo y
 * los bounds calculados a partir de todos los puntos de la geometría
 * resultante (no solo de los puntos de ancla).
 *
 * Esta utilidad debe ser la ÚNICA fuente de verdad para geometryPolyline y
 * bounds en los servicios de rutas. El cliente nunca debe computar ni
 * sobrescribir estos campos.
 */

import axios from "axios";
import { HttpsError } from "firebase-functions/v2/https";
import { RouteBounds } from "../../types/routes";

const OSRM_BASE_URL =
  process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

// ─── Decodificador mínimo de Google Encoded Polyline ─────────────────────────
// Compatible con la geometría que devuelve OSRM en geometries=polyline.
// Sirve para calcular bounds precisos a partir de todos los puntos del trazado.

function decodePolylinePoints(
  encoded: string
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let b: number;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

function computeBoundsFromPoints(
  points: Array<{ lat: number; lng: number }>
): RouteBounds {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

// ─── Resultado público ────────────────────────────────────────────────────────

export interface RouteGeometryResult {
  geometryPolyline: string;
  bounds: RouteBounds;
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Obtiene la geometría de carretera real para una colección de waypoints
 * usando OSRM, en el orden en que se proporcionan.
 *
 * @param anchorPoints Lista de coordenadas {latitude, longitude} en orden de
 *                     recorrido. Mínimo 2 puntos requeridos.
 * @returns geometryPolyline (Google Encoded Polyline compatible con
 *          decodePolyline del frontend) y bounds derivados de la geometría
 *          completa.
 */
export async function generateRouteGeometry(
  anchorPoints: Array<{ latitude: number; longitude: number }>
): Promise<RouteGeometryResult> {
  if (anchorPoints.length < 2) {
    throw new HttpsError(
      "invalid-argument",
      "Se requieren al menos 2 puntos de ancla para generar el trazado de ruta"
    );
  }

  const coordinatesStr = anchorPoints
    .map((p) => `${p.longitude},${p.latitude}`)
    .join(";");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let osrmData: any;
  try {
    const response = await axios.get(
      `${OSRM_BASE_URL}/route/v1/driving/${coordinatesStr}`,
      {
        params: {
          alternatives: false,
          overview: "full",
          steps: false,
          geometries: "polyline",
        },
        timeout: 15000,
      }
    );
    osrmData = response.data;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error de red desconocido";
    throw new HttpsError(
      "unavailable",
      `Servicio de trazado de ruta no disponible (${message}). Verifica la conexión o intenta más tarde.`
    );
  }

  const route = osrmData?.routes?.[0];
  if (osrmData?.code !== "Ok" || !route) {
    throw new HttpsError(
      "failed-precondition",
      `OSRM no pudo calcular el trazado de ruta: ${
        osrmData?.code || "UNKNOWN"
      }`
    );
  }

  const geometryPolyline = String(route.geometry || "");
  if (!geometryPolyline) {
    throw new HttpsError(
      "failed-precondition",
      "OSRM no devolvió geometría para la ruta"
    );
  }

  // Calcular bounds desde los puntos reales del trazado, no solo los de ancla.
  const decoded = decodePolylinePoints(geometryPolyline);
  const bounds =
    decoded.length > 0
      ? computeBoundsFromPoints(decoded)
      : computeBoundsFromPoints(
          anchorPoints.map((p) => ({ lat: p.latitude, lng: p.longitude }))
        );

  return { geometryPolyline, bounds };
}
