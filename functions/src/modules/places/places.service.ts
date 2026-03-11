import axios from "axios";
import { HttpsError } from "firebase-functions/v2/https";
import { getGoogleMapsApiKey } from "../../config/googleMaps";
import { PlaceDetailsRequest, PlacesAutocompleteRequest } from "../../types/places";

export async function placesAutocompleteService(payload: PlacesAutocompleteRequest) {
  const apiKey = getGoogleMapsApiKey();

  const response = await axios.get("https://maps.googleapis.com/maps/api/place/autocomplete/json", {
    params: {
      input: payload.query,
      key: apiKey,
      components: `country:${payload.countryCode || "PA"}`,
      location: payload.location || "8.4333,-82.4333",
      radius: payload.radius || 50000,
      language: "es",
    },
  });

  if (!Array.isArray(response.data?.predictions)) {
    throw new HttpsError("failed-precondition", "Respuesta inválida en autocomplete");
  }

  return response.data.predictions;
}

export async function placeDetailsService(payload: PlaceDetailsRequest) {
  const apiKey = getGoogleMapsApiKey();

  const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
    params: {
      place_id: payload.placeId,
      fields: "name,geometry,formatted_address,place_id",
      key: apiKey,
      language: "es",
    },
  });

  if (response.data?.status !== "OK" || !response.data?.result?.geometry?.location) {
    throw new HttpsError("failed-precondition", `Google Places details error: ${response.data?.status || "UNKNOWN"}`);
  }

  return response.data.result;
}
