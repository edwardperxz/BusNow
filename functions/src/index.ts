import { getApps, initializeApp } from "firebase-admin/app";

// Inicializar Firebase Admin SDK antes de cualquier importación que lo use.
// En Cloud Functions, initializeApp() sin argumentos usa las credenciales de entorno.
if (!getApps().length) {
  initializeApp();
}

import { updateDriverLocation } from "./modules/drivers/driver.controller";
import { cleanupInactiveBuses } from "./modules/drivers/cleanup";
import { calculateETA, getRouteDirections } from "./modules/eta/eta.controller";
import { placeDetails, placesAutocomplete } from "./modules/places/places.controller";
import { createRoute, deleteRoute, getAdminRoutes, getRoutes, getRouteDetail, updateRoute } from "./modules/routes/routes.controller";
import {
  addTicketResponse,
  assignCityToUser,
  assignTicket,
  auditChange,
  calculateBusTiming,
  createUserAdmin,
  createCityAdmin,
  cleanupOldLogs,
  cleanupOldTimings,
  createTicket,
  deleteBusAdmin,
  deleteCityAdmin,
  deleteUserAdmin,
  detectStopPassage,
  getBusesByCity,
  getRoutesByCity,
  sendNotification,
  sendTopicNotification,
  updateBusAdmin,
  updateCityAdmin,
  updateUserAdmin,
} from "./modules/operations/operations.controller";
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
  getAdminRoutes,
  getRouteDetail,
  createRoute,
  updateRoute,
  deleteRoute,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  assignCityToUser,
  calculateBusTiming,
  detectStopPassage,
  sendNotification,
  sendTopicNotification,
  createTicket,
  addTicketResponse,
  assignTicket,
  createCityAdmin,
  updateCityAdmin,
  deleteCityAdmin,
  updateBusAdmin,
  deleteBusAdmin,
  auditChange,
  getRoutesByCity,
  getBusesByCity,
  cleanupOldTimings,
  cleanupOldLogs,
  cleanupInactiveBuses,
};

// Limpieza de cache ETA expirado — se ejecuta cada 5 minutos
export const cleanupETACache = onSchedule("every 5 minutes", async () => {
  const deleted = await purgeExpiredETACache();
  logger.info(`[ETACache] Purged ${deleted} expired entries`);
});
