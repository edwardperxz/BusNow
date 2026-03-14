import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

import OpenFreeMapView from '../../map/components/OpenFreeMapView';
import { CommonStyles, getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';

type Coordinate = { latitude: number; longitude: number };

interface CoordinatePickerMapProps {
  visible: boolean;
  title: string;
  initialCoordinate?: Coordinate;
  onSelect: (coordinate: Coordinate) => void;
  onClose: () => void;
}

export default function CoordinatePickerMap({
  visible,
  title,
  initialCoordinate,
  onSelect,
  onClose,
}: CoordinatePickerMapProps) {
  const { theme } = useSettings();
  const colors = getTheme(theme === 'dark');

  const [selected, setSelected] = useState<Coordinate | null>(initialCoordinate ?? null);

  const center = useMemo(() => {
    if (selected) return selected;
    if (initialCoordinate) return initialCoordinate;
    return { latitude: 8.4333, longitude: -82.4333 };
  }, [initialCoordinate, selected]);

  const selectedAsPoint = selected
    ? { latitude: selected.latitude, longitude: selected.longitude, address: 'Punto seleccionado' }
    : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            height: '82%',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              paddingHorizontal: CommonStyles.spacing.md,
              paddingVertical: CommonStyles.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray200,
            }}
          >
            <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>{title}</Text>
            <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
              Toca el mapa para seleccionar las coordenadas.
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <OpenFreeMapView
              initialCenter={center}
              location={null}
              routeCoordinates={[]}
              etaCoordinates={[]}
              buses={[]}
              selectedBusId={null}
              selectedPlace={null}
              routeOrigin={selectedAsPoint}
              routeDestination={null}
              onSelectBus={() => undefined}
              onMapClick={setSelected}
            />
          </View>

          <View
            style={{
              padding: CommonStyles.spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.gray200,
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.gray300,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.gray700, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selected && onSelect(selected)}
              disabled={!selected}
              style={{
                flex: 1,
                backgroundColor: selected ? colors.primary : colors.gray300,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.white, fontWeight: '700' }}>Usar punto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
