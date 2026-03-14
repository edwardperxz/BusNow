import axios from "axios";
import { HttpsError } from "firebase-functions/v2/https";
import { PlaceDetailsRequest, PlacesAutocompleteRequest } from "../../types/places";

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || "BusNow/1.0 (+https://github.com/edwardperxz/BusNow)";

interface NominatimSearchItem {
  display_name?: string;
  name?: string;
  lat?: string;
  lon?: string;
  osm_type?: string;
  osm_id?: number | string;
}

function parseLocation(location?: string) {
  if (!location) return null;
  const [latRaw, lngRaw] = location.split(",");
  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function buildViewBox(location: { latitude: number; longitude: number }, radiusMeters: number) {
  const latDelta = radiusMeters / 111320;
  const lonDelta = radiusMeters / (111320 * Math.max(Math.cos((location.latitude * Math.PI) / 180), 0.3));

  const left = location.longitude - lonDelta;
  const right = location.longitude + lonDelta;
  const top = location.latitude + latDelta;
  const bottom = location.latitude - latDelta;

  return `${left},${top},${right},${bottom}`;
}

function toPrediction(item: NominatimSearchItem) {
  const displayName = String(item.display_name || "").trim();
  const name = String(item.name || "").trim();
  const displayParts = displayName.split(",").map((part) => part.trim()).filter(Boolean);

  const mainText = name || displayParts[0] || displayName;
  const secondaryText = displayParts.length > 1 ? displayParts.slice(1).join(", ") : "";

  const lat = Number(item.lat);
  const lon = Number(item.lon);
  const coordPlaceId = Number.isFinite(lat) && Number.isFinite(lon) ? `coord:${lat},${lon}` : "";
  const fallbackPlaceId = `osm:${item.osm_type || "node"}:${String(item.osm_id || "0")}`;

  return {
    place_id: coordPlaceId || fallbackPlaceId,
    description: displayName || mainText,
    structured_formatting: {
      main_text: mainText,
      secondary_text: secondaryText,
    },
  };
}

export async function placesAutocompleteService(payload: PlacesAutocompleteRequest) {
  const origin = parseLocation(payload.location || "8.4333,-82.4333");
  const radius = Number(payload.radius || 50000);

  const params: Record<string, string | number> = {
    q: payload.query,
    format: "jsonv2",
    addressdetails: 1,
    limit: 8,
    "accept-language": "es",
  };

  if (payload.countryCode) {
    params.countrycodes = String(payload.countryCode).toLowerCase();
  }

  if (origin) {
    params.viewbox = buildViewBox(origin, radius);
    params.bounded = 1;
  }

  const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
    params,
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT,
    },
  });

  if (!Array.isArray(response.data)) {
    throw new HttpsError("failed-precondition", "Respuesta inválida en autocomplete");
  }

  return response.data.map((item: NominatimSearchItem) => toPrediction(item));
}

export async function placeDetailsService(payload: PlaceDetailsRequest) {
  const placeId = String(payload.placeId || "").trim();
  const coordMatch = /^coord:([-\d.]+),([-\d.]+)$/i.exec(placeId);

  if (coordMatch) {
    const lat = Number(coordMatch[1]);
    const lng = Number(coordMatch[2]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new HttpsError("invalid-argument", "placeId coord inválido");
    }

    return {
      place_id: placeId,
      name: "Ubicación seleccionada",
      formatted_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      geometry: {
        location: { lat, lng },
      },
    };
  }

  const osmMatch = /^osm:(node|way|relation):([\d]+)$/i.exec(placeId);
  if (osmMatch) {
    const osmTypeMap: Record<string, string> = {
      node: "N",
      way: "W",
      relation: "R",
    };

    const response = await axios.get(`${NOMINATIM_BASE_URL}/lookup`, {
      params: {
        format: "jsonv2",
        "accept-language": "es",
        osm_ids: `${osmTypeMap[osmMatch[1].toLowerCase()]}${osmMatch[2]}`,
      },
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
      },
    });

    const item = Array.isArray(response.data) ? response.data[0] : null;
    const lat = Number(item?.lat);
    const lng = Number(item?.lon);

    if (!item || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new HttpsError("failed-precondition", "No se pudo resolver el lugar solicitado");
    }

    return {
      place_id: placeId,
      name: String(item?.name || "Ubicación seleccionada"),
      formatted_address: String(item?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`),
      geometry: {
        location: { lat, lng },
      },
    };
  }

  throw new HttpsError("invalid-argument", "placeId no soportado por el proveedor actual");
}
