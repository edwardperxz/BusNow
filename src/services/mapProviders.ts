import { httpsCallable } from 'firebase/functions';

import { auth, fn } from './firebaseApp';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetailsResult {
  geometry?: { location?: { lat: number; lng: number } };
  formatted_address?: string;
  name?: string;
}

interface RouteDirectionsResponse {
  ok?: boolean;
  route?: {
    polyline: string;
    origin: {
      latitude: number;
      longitude: number;
      address: string;
    };
    destination: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
}

interface EtaResponse {
  ok?: boolean;
  eta?: {
    durationSeconds: number;
    durationText: string;
    distanceMeters: number;
    distanceText: string;
    polyline: string;
    startAddress?: string;
    endAddress?: string;
  };
}

interface CallableErrorLike {
  code?: string;
  details?: unknown;
  message: string;
}

class CallableClientError extends Error {
  code?: string;
  details?: unknown;

  constructor(error: CallableErrorLike) {
    super(error.message);
    this.name = 'CallableClientError';
    this.code = error.code;
    this.details = error.details;
  }
}

const placesAutocompleteFn = httpsCallable(fn, 'placesAutocomplete');
const placeDetailsFn = httpsCallable(fn, 'placeDetails');
const getRouteDirectionsFn = httpsCallable(fn, 'getRouteDirections');
const calculateEtaFn = httpsCallable(fn, 'calculateETA');

function getCallableErrorCode(error: unknown): string {
  const code = (error as { code?: unknown })?.code;
  return typeof code === 'string' ? code : '';
}

function getCallableErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: unknown })?.message;
  return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
}

function getCallableErrorDetails(error: unknown): unknown {
  return (error as { details?: unknown })?.details;
}

function toCallableClientError(error: unknown, fallback: string): CallableClientError {
  return new CallableClientError({
    code: getCallableErrorCode(error),
    message: getCallableErrorMessage(error, fallback),
    details: getCallableErrorDetails(error),
  });
}

async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function callWithAuthRetry<TRequest, TResponse>(
  callable: (payload: TRequest) => Promise<{ data: unknown }>,
  payload: TRequest,
  fallbackMessage: string
): Promise<TResponse> {
  try {
    const response = await callable(payload);
    return response.data as TResponse;
  } catch (error: unknown) {
    const code = getCallableErrorCode(error);

    // Si hay usuario activo y token vencido/desincronizado, refrescar y reintentar una vez.
    if (code === 'functions/unauthenticated' && auth.currentUser) {
      try {
        await auth.currentUser.getIdToken(true);
        await delay(250);
        const retryResponse = await callable(payload);
        return retryResponse.data as TResponse;
      } catch (retryError) {
        throw toCallableClientError(retryError, fallbackMessage);
      }
    }

    throw toCallableClientError(error, fallbackMessage);
  }
}

export async function searchPlaces(params: {
  query: string;
  countryCode: string;
  location: string;
  radius: number;
}): Promise<PlacePrediction[]> {
  const data = await callWithAuthRetry<typeof params, { ok?: boolean; predictions?: PlacePrediction[] }>(
    placesAutocompleteFn,
    params,
    'Error consultando lugares'
  );
  return data?.ok && Array.isArray(data.predictions) ? data.predictions : [];
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult | null> {
  const data = await callWithAuthRetry<{ placeId: string }, { ok?: boolean; result?: PlaceDetailsResult }>(
    placeDetailsFn,
    { placeId },
    'Error obteniendo detalle del lugar'
  );
  return data?.ok && data.result ? data.result : null;
}

export async function getRouteDirections(params: {
  origin: string;
  destination: string;
}): Promise<RouteDirectionsResponse> {
  return callWithAuthRetry<typeof params, RouteDirectionsResponse>(
    getRouteDirectionsFn,
    params,
    'Error obteniendo direcciones'
  );
}

export async function calculateEta(params: {
  busLocation: { latitude: number; longitude: number };
  stopLocation: { latitude: number; longitude: number };
}): Promise<EtaResponse> {
  // For ETA updates, force a fresh token before the call to avoid stale auth state.
  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(true);
    } catch {
      // Ignore and let callable error handling provide a user-facing outcome.
    }
  }

  return callWithAuthRetry<typeof params, EtaResponse>(
    calculateEtaFn,
    params,
    'Error calculando ETA'
  );
}
