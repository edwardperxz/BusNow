export interface PlacesAutocompleteRequest {
  query: string;
  countryCode?: string;
  location?: string;
  radius?: number;
}

export interface PlaceDetailsRequest {
  placeId: string;
}
