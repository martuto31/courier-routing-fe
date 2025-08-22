export interface ParsedAddress {
  address: string;
  priority: number;
}

export interface GeocodedAddress extends ParsedAddress {
  lat: number;
  lon: number;
}

export interface GetOptimisedRouteResponse {
  unoptimisedGeoAddresses: GeocodedAddress[];
  optimisedRoute: OptimisedRoute;
}

export interface GetGeocodedAddressesResponse {
  geocodedAdresses: GeocodedAddress[];
  notGeocodedAddresses: string[];
}

export interface OrderedLocation {
  address: string;
  lon: number;
  lat: number;
  priority?: number;
}

export interface OptimisedRoute {
  locationOrder: OrderedLocation[];
  googleMapsUrls: string[];
}
