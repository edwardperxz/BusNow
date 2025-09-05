// =============================================================================
// MAP COMPONENTS - NATIVE ONLY
// =============================================================================

import React, { forwardRef } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export interface CrossPlatformMapProps {
  children?: React.ReactNode;
  style?: any;
  region?: any;
  onRegionChangeComplete?: (region: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  toolbarEnabled?: boolean;
  provider?: any;
}

export const CrossPlatformMap = forwardRef<any, CrossPlatformMapProps>((props, ref) => {
  return <MapView ref={ref} {...props} />;
});

export const CrossPlatformMarker: React.FC<any> = (props) => {
  return <Marker {...props} />;
};

export const CrossPlatformPolyline: React.FC<any> = (props) => {
  return <Polyline {...props} />;
};

export { MapView, Marker, Polyline, PROVIDER_GOOGLE };
