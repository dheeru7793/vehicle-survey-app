'use client';

import { Box, Typography } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export function MapView({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'gmaps-script',
  });

  if (!apiKey) {
    return (
      <Box p={3}>
        <Typography color="text.secondary">
          Set NEXT_PUBLIC_GOOGLE_MAPS_KEY to display the map.
        </Typography>
        <Typography variant="body2" mt={1}>
          GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
        </Typography>
      </Box>
    );
  }
  if (loadError) return <Box p={3}>Failed to load map.</Box>;
  if (!isLoaded) return <Box p={3}>Loading map…</Box>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: 360 }}
      center={{ lat, lng }}
      zoom={15}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      <Marker position={{ lat, lng }} title={label} />
    </GoogleMap>
  );
}
