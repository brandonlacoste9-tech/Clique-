import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';

import { colors, typography, spacing } from '../theme/cliqueTheme';

const { width, height } = Dimensions.get('window');

// Mock data - replace with real friend locations
const mockFriends = [
  { id: '1', lat: 45.5017, lng: -73.5673, name: 'Alex', isOnline: true },
  { id: '2', lat: 45.5088, lng: -73.554, name: 'Sam', isOnline: false },
  { id: '3', lat: 45.495, lng: -73.58, name: 'Jordan', isOnline: true }
];

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Carte</Text>
      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.5017,
          longitude: -73.5673,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
        customMapStyle={darkMapStyle}
      >
        {mockFriends.map(friend => (
          <Marker
            key={friend.id}
            coordinate={{ latitude: friend.lat, longitude: friend.lng }}
            title={friend.name}
          >
            <View style={[
              styles.marker,
              friend.isOnline && styles.markerOnline
            ]}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendOnline]} />
          <Text style={styles.legendText}>En ligne</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendOffline]} />
          <Text style={styles.legendText}>Hors ligne</Text>
        </View>
      </View>
    </View>
  );
}

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8e8e93' }]
  },
  {
    featureType: 'water',
    stylers: [{ color: '#0d0d0d' }]
  },
  {
    featureType: 'road',
    stylers: [{ color: '#2a2a2a' }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    fontSize: typography.sizes['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md
  },
  map: {
    flex: 1
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.text.muted,
    justifyContent: 'center',
    alignItems: 'center'
  },
  markerOnline: {
    borderColor: colors.accent.green
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold.DEFAULT
  },
  legend: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: spacing.md,
    borderRadius: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendOnline: {
    backgroundColor: colors.accent.green
  },
  legendOffline: {
    backgroundColor: colors.text.muted
  },
  legendText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm
  }
});
