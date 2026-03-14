/**
 * Decodifica un polyline codificado de Google Maps a un array de coordenadas
 * @param encoded - String polyline codificado
 * @returns Array de objetos con latitude y longitude
 */
export function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const poly: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return poly;
}

function encodeCoordinate(value: number): string {
  let current = value < 0 ? ~(value << 1) : value << 1;
  let output = '';

  while (current >= 0x20) {
    output += String.fromCharCode((0x20 | (current & 0x1f)) + 63);
    current >>= 5;
  }

  output += String.fromCharCode(current + 63);
  return output;
}

export function encodePolyline(coordinates: { latitude: number; longitude: number }[]): string {
  let lastLatitude = 0;
  let lastLongitude = 0;

  return coordinates.reduce((encoded, coordinate) => {
    const latitude = Math.round(coordinate.latitude * 1e5);
    const longitude = Math.round(coordinate.longitude * 1e5);

    const latitudeDelta = latitude - lastLatitude;
    const longitudeDelta = longitude - lastLongitude;

    lastLatitude = latitude;
    lastLongitude = longitude;

    return `${encoded}${encodeCoordinate(latitudeDelta)}${encodeCoordinate(longitudeDelta)}`;
  }, '');
}
