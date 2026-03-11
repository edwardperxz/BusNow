import { updateDriverLocation } from "./modules/drivers/driver.controller";
import { calculateETA, getRouteDirections } from "./modules/eta/eta.controller";
import { placeDetails, placesAutocomplete } from "./modules/places/places.controller";
import { getRoutes, getRouteDetail } from "./modules/routes/routes.controller";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { purgeExpiredETACache } from "./modules/eta/eta.repository";

export {
  calculateETA,
  getRouteDirections,
  placesAutocomplete,
  placeDetails,
  updateDriverLocation,
  getRoutes,
  getRouteDetail,
};

// Limpieza de cache ETA expirado — se ejecuta cada 5 minutos
export const cleanupETACache = onSchedule("every 5 minutes", async () => {
  const deleted = await purgeExpiredETACache();
  logger.info(`[ETACache] Purged ${deleted} expired entries`);
});
