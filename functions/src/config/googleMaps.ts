import { HttpsError } from "firebase-functions/v2/https";

export function getGoogleMapsApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new HttpsError("failed-precondition", "Falta GOOGLE_MAPS_API_KEY segura en Cloud Functions");
  }
  return key;
}
