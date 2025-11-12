import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface RecentPlace extends Place {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface GooglePlacesSearchProps {
  onPlaceSelect: (place: Place & { latitude: number; longitude: number }) => void;
  placeholder?: string;
  apiKey: string;
  countryCode?: string;
  location?: string;
  radius?: number;
  onSearchStateChange?: (state: 'hidden' | 'neutral' | 'expanded') => void;
}

const RECENT_PLACES_KEY = '@BusNow:recent_places';
const MAX_RECENT_PLACES = 5;

const GooglePlacesSearchInteractive: React.FC<GooglePlacesSearchProps> = ({
  onPlaceSelect,
  placeholder = "¿A dónde vas?",
  apiKey,
  countryCode = 'PA',
  location = '8.4333,-82.4333',
  radius = 50000,
  onSearchStateChange,
}) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchState, setSearchState] = useState<'hidden' | 'neutral' | 'expanded'>('neutral');
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  
  // Referencias para manejar el TextInput
  const textInputRef = useRef<TextInput>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;
  
  // El buscador siempre mantiene el mismo tamaño, solo se mueve hacia abajo
  const SEARCH_HEIGHT = height * 0.95; // Ajustado para coincidir con la imagen
  const NEUTRAL_OFFSET = 0; // Posición neutral (completamente visible)
  const PARTIAL_OFFSET = SEARCH_HEIGHT - 280; // Neutral más visible para mejor accesibilidad
  const HIDDEN_OFFSET = SEARCH_HEIGHT - 60; // Hidden más visible para mejor accesibilidad
  
  const { theme } = useSettings();
  const colors = getTheme(theme === 'dark');
  const isDark = theme === 'dark';

  // Optimización: Memoización de estilos dinámicos para mejor rendimiento
  const dynamicStyles = useCallback(() => ({
    container: {
      ...styles.container,
      backgroundColor: colors.white,
      borderColor: colors.gray200,
    },
    inputWrapper: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
    },
    dragHandle: {
      backgroundColor: colors.gray300,
    }
  }), [colors, isDark]);

  const memoizedStyles = dynamicStyles();

  const forceDismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    if (textInputRef.current) {
      try { textInputRef.current.blur(); } catch {}
    }
    setTimeout(() => {
      Keyboard.dismiss();
      if (textInputRef.current) {
        try { textInputRef.current.blur(); } catch {}
      }
    }, 50);
  }, []);

  useEffect(() => {
    loadRecentPlaces();
    // Posición inicial directa sin animación
    translateY.setValue(PARTIAL_OFFSET);
    // Notificar el estado inicial
    if (onSearchStateChange) {
      onSearchStateChange('neutral');
    }
  }, []);

  // Notificar cambios de estado al componente padre
  useEffect(() => {
    if (onSearchStateChange) {
      onSearchStateChange(searchState);
    }
  }, [searchState, onSearchStateChange]);

  // Asegurar cierre de teclado siempre que se pase a hidden (iOS-safe)
  useEffect(() => {
    if (searchState === 'hidden') {
      // Ejecutar al finalizar el frame para no competir con la animación
      requestAnimationFrame(() => forceDismissKeyboard());
    }
  }, [searchState, forceDismissKeyboard]);

  // Lógica de toques en la barra para cambiar estados
  const handleDragBarPress = () => {
    if (searchState === 'neutral') {
      // De neutral a expanded 
      setToExpandedState();
    } else if (searchState === 'expanded') {
      // De expanded a hidden
      setToHiddenState();
    } else if (searchState === 'hidden') {
      // De hidden a neutral
      setToNeutralState();
    }
  };

  // Lógica de gestos para deslizar el buscador
  // ORDEN CÍCLICO: neutral → expanded → neutral → hidden → neutral → expanded (repeat)
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: gestureTranslateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;

      // Resetear valor del gesto
      gestureTranslateY.setValue(0);

      // Detectar dirección principal
      const movingDown = velocityY > 0 || translationY > 0;
      const movingUp = velocityY < 0 || translationY < 0;

      // Intensidad del gesto (distancia y velocidad combinadas)
      const speed = Math.abs(velocityY);
      const distance = Math.abs(translationY);
      const strong = speed > 800 || distance > 120; // gesto decidido
      const medium = speed > 400 || distance > 60;  // gesto claro

      if (movingDown) {
        // Nueva lógica: desde expanded bajar siempre a hidden (cerrar y ocultar teclado)
        if (searchState === 'expanded') {
          setToHiddenState();
          return;
        }
        // Desde neutral: gesto fuerte a hidden, gesto medio también, gesto leve queda neutral
        if (searchState === 'neutral') {
          if (medium) {
            setToHiddenState();
          } else {
            // gesto leve: no cambiar
            setToNeutralState();
          }
          return;
        }
        // Desde hidden: mantener hidden
        if (searchState === 'hidden') {
          setToHiddenState();
          return;
        }
      } else if (movingUp) {
        // Subir: desde hidden a neutral siempre
        if (searchState === 'hidden') {
          setToNeutralState();
          return;
        }
        // Desde neutral a expanded con gesto medio/fuerte, leve mantiene neutral
        if (searchState === 'neutral') {
          if (medium) {
            setToExpandedState();
          } else {
            setToNeutralState();
          }
          return;
        }
        // Desde expanded un gesto hacia arriba mantiene expanded
        if (searchState === 'expanded') {
          setToExpandedState();
          return;
        }
      }
    }
  };

  const setToHiddenState = () => {
    setSearchState('hidden');
    setShowResults(false);
    // Notificar inmediatamente el cambio de estado
    if (onSearchStateChange) {
      onSearchStateChange('hidden');
    }
    // Ocultar teclado si estaba abierto (forzado, iOS-safe)
    forceDismissKeyboard();
    // Detener cualquier animación en progreso para evitar glitches
    translateY.stopAnimation();
    Animated.timing(translateY, {
      toValue: HIDDEN_OFFSET, // Deslizar hacia abajo para ocultar
      duration: 200, // Más rápido para mejor respuesta
      easing: Easing.linear, // Movimiento completamente lineal sin rebote
      useNativeDriver: false,
    }).start();
  };

  const setToNeutralState = () => {
    setSearchState('neutral');
    setShowResults(false);
    // Notificar inmediatamente el cambio de estado
    if (onSearchStateChange) {
      onSearchStateChange('neutral');
    }
    // Detener cualquier animación en progreso para evitar glitches
    translateY.stopAnimation();
    Animated.timing(translateY, {
      toValue: PARTIAL_OFFSET, // Parcialmente visible
      duration: 220, // Duración optimizada para fluidez
      easing: Easing.linear, // Movimiento completamente lineal sin rebote
      useNativeDriver: false,
    }).start();
  };

  const setToExpandedState = () => {
    setSearchState('expanded');
    setShowResults(true);
    // Notificar inmediatamente el cambio de estado
    if (onSearchStateChange) {
      onSearchStateChange('expanded');
    }
    // Detener cualquier animación en progreso para evitar glitches
    translateY.stopAnimation();
    Animated.timing(translateY, {
      toValue: NEUTRAL_OFFSET, // Completamente visible
      duration: 280, // Duración óptima para expansión
      easing: Easing.linear, // Movimiento completamente lineal sin rebote
      useNativeDriver: false,
    }).start();
  };

  const loadRecentPlaces = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_PLACES_KEY);
      if (stored) {
        const places = JSON.parse(stored);
        setRecentPlaces(places);
      }
    } catch (error) {
      console.error('Error loading recent places:', error);
    }
  };

  const saveRecentPlace = async (place: RecentPlace) => {
    try {
      const existing = recentPlaces.filter(p => p.place_id !== place.place_id);
      const newRecents = [place, ...existing].slice(0, MAX_RECENT_PLACES);
      setRecentPlaces(newRecents);
      await AsyncStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(newRecents));
    } catch (error) {
      console.error('Error saving recent place:', error);
    }
  };

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setPredictions([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);

    try {
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&key=${apiKey}&components=country:${countryCode}&location=${location}&radius=${radius}&language=es`;

      const response = await fetch(autocompleteUrl);
      const data = await response.json();

      if (data.predictions) {
        setPredictions(data.predictions);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimización: useCallback para evitar recrear funciones en cada render
  const handleInputChange = useCallback((text: string) => {
    setQuery(text);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 300); // Debounce optimizado
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setPredictions([]);
    setShowResults(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Función utilitaria para ocultar buscador y teclado al seleccionar ubicación
  const hideSearchAndKeyboard = useCallback(() => {
    setToHiddenState();
    Keyboard.dismiss();
    if (textInputRef.current) {
      textInputRef.current.blur();
    }
  }, []);

  const getPlaceDetails = async (placeId: string) => {
    setIsLoading(true);
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,formatted_address&key=${apiKey}&language=es`;
      
      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.result && data.result.geometry) {
        const place = predictions.find(p => p.place_id === placeId);
        if (place) {
          const selectedPlace = {
            ...place,
            latitude: data.result.geometry.location.lat,
            longitude: data.result.geometry.location.lng,
          };
          
          const recentPlace: RecentPlace = {
            ...selectedPlace,
            timestamp: Date.now(),
          };
          await saveRecentPlace(recentPlace);
          
          onPlaceSelect(selectedPlace);
          setQuery(place.structured_formatting.main_text);
          setShowResults(false);
          setPredictions([]);
          // Ocultar el buscador y el teclado al seleccionar una ubicación
          hideSearchAndKeyboard();
        }
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlacePress = (place: Place) => {
    getPlaceDetails(place.place_id);
  };

  const clearSearchOld = () => {
    setQuery('');
    setPredictions([]);
    setToNeutralState();
  };

  const renderPrediction = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={[styles.predictionItem, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}
      onPress={() => handlePlacePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.predictionContent}>
        <Ionicons 
          name="location-outline" 
          size={20} 
          color={colors.gray500} 
          style={styles.locationIcon}
          accessibilityLabel="Icono de ubicación"
        />
        <View style={styles.textContent}>
          <Text style={[styles.mainText, { color: colors.gray800 }]} numberOfLines={1}>
            {item.structured_formatting.main_text}
          </Text>
          <Text style={[styles.secondaryText, { color: colors.gray600 }]} numberOfLines={1}>
            {item.structured_formatting.secondary_text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View 
        style={[
          styles.container,
          { 
            height: SEARCH_HEIGHT, // Altura fija siempre
            transform: [
              { translateY: translateY } // Solo usar translateY principal, eliminar gestureTranslateY para evitar glitches
            ],
            backgroundColor: colors.white, // Aplicar tema dinámico
          }
        ]}
      >
      {/* Drag Indicator - Línea horizontal tocable con mejor feedback */}
      <TouchableOpacity 
        style={styles.dragHandle} 
        onPress={handleDragBarPress} 
        activeOpacity={0.5}
        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }} // Mayor área de toque
      >
        <View style={[styles.dragIndicator, { backgroundColor: colors.gray300 }]} />
      </TouchableOpacity>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={[styles.inputWrapper, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={colors.gray500} 
              style={styles.searchIcon}
              accessibilityLabel="Icono de búsqueda"
            />
            <TextInput
              ref={textInputRef}
              style={[styles.textInput, { color: colors.gray800 }]}
              value={query}
              onChangeText={handleInputChange}
              placeholder={placeholder}
              placeholderTextColor={colors.gray400}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              onFocus={setToExpandedState}
              accessibilityLabel="Buscar destino"
              accessibilityHint="Escribe para buscar lugares cerca de ti"
              blurOnSubmit={false} // Mantener foco para mejor UX
            />
            {(query.length > 0 || isLoading) && (
              <TouchableOpacity 
                onPress={clearSearch} 
                style={styles.clearButton}
                disabled={isLoading}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityHint="Borra el texto de búsqueda"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.gray500} />
                ) : (
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color={colors.gray500} 
                    accessibilityLabel="Limpiar búsqueda"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contenido expandido - siempre presente */}
        <View style={styles.expandedContent}>
            {/* Resultados de búsqueda */}
            {showResults && predictions.length > 0 ? (
              <View style={styles.resultsSection}>
                <FlatList
                  data={predictions}
                  renderItem={renderPrediction}
                  keyExtractor={(item) => item.place_id}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                />
              </View>
            ) : (
              <>
                {/* Lugares recientes */}
                {recentPlaces.length > 0 && (
                  <View style={[styles.section, { flex: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.gray700 }]}>
                      Lugares buscados recientemente
                    </Text>
                    <ScrollView 
                      style={{ flex: 1 }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      bounces={false} // Eliminar rebote en iOS
                      overScrollMode="never" // Eliminar rebote en Android
                      alwaysBounceVertical={false} // Sin rebote vertical
                    >
                      {recentPlaces.map((item) => (
                        <TouchableOpacity
                          key={item.place_id}
                          style={[styles.predictionItem, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}
                          onPress={() => {
                            onPlaceSelect(item);
                            setQuery(item.structured_formatting.main_text);
                            // Ocultar el buscador y el teclado al seleccionar un lugar reciente
                            hideSearchAndKeyboard();
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`Seleccionar ${item.structured_formatting.main_text}`}
                          accessibilityHint="Lugar reciente"
                        >
                          <View style={styles.predictionContent}>
                            <Ionicons 
                              name="time-outline" 
                              size={20} 
                              color={colors.gray500} 
                              style={styles.locationIcon}
                              accessibilityLabel="Lugar reciente"
                            />
                            <View style={styles.textContent}>
                              <Text style={[styles.mainText, { color: colors.gray800 }]} numberOfLines={1}>
                                {item.structured_formatting.main_text}
                              </Text>
                              <Text style={[styles.secondaryText, { color: colors.gray600 }]} numberOfLines={1}>
                                {item.structured_formatting.secondary_text}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // Sin espacio abajo
    left: 0,   // Sin espacio a los lados
    right: 0,  // Sin espacio a los lados
    zIndex: 500, // Menor que el menú hamburguesa para estar por debajo
    borderTopLeftRadius: 20,  // Solo bordes superiores redondeados
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dragHandle: {
    paddingVertical: 16, // Mayor área de toque
    alignItems: 'center',
    paddingTop: 20, // Más espacio arriba
    paddingBottom: 12,
    marginBottom: 4, // Separación del contenido
  },
  dragIndicator: {
    width: 50, // Más ancho para mayor visibilidad
    height: 5, // Más alto para mejor visibilidad
    borderRadius: 2,
    opacity: 0.5,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  expandedContent: {
    flex: 1, // Usar todo el espacio disponible del contenedor
    paddingTop: 8,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsSection: {
    flex: 1,
  },
  predictionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default GooglePlacesSearchInteractive;