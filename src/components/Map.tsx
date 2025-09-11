// src/components/Map.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, ThemeProvider, createTheme, Button, CircularProgress, Checkbox, ListItemText, ToggleButtonGroup, ToggleButton, Typography, Switch, FormControlLabel } from '@mui/material';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const darkTheme = createTheme({ palette: { mode: 'dark' } });

interface Place {
  name: string;
  id: string;
  geoJsonPath: string;
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWaterLayer, setShowWaterLayer] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    fetch('/data/polygons.json')
      .then(res => res.json())
      .then(data => {
        setPlaces(data);
      });
  }, []);

  const removePolygon = () => {
    if (!map.current || !isMapLoaded) return;
    const currentMap = map.current;
    if (currentMap.getSource('polygon-source')) {
      if (currentMap.getLayer('polygon-layer')) currentMap.removeLayer('polygon-layer');
      if (currentMap.getLayer('polygon-outline')) currentMap.removeLayer('polygon-outline');
      currentMap.removeSource('polygon-source');
    }
  };

  const loadMultiplePolygons = async (paths: string[]) => {
    if (!map.current || paths.length === 0 || !isMapLoaded) {
      removePolygon();
      return;
    };
    const currentMap = map.current;
    removePolygon();

    try {
      const responses = await Promise.all(paths.map(path => fetch(path).then(res => res.json())));
      const allFeatures = responses.flatMap(data => data.features);
      const combinedGeoJson = { type: 'FeatureCollection', features: allFeatures };

      currentMap.addSource('polygon-source', { type: 'geojson', data: combinedGeoJson });
      currentMap.addLayer({
        id: 'polygon-layer', type: 'fill', source: 'polygon-source',
        paint: { 'fill-color': '#0080ff', 'fill-opacity': 0.5 }
      });
      currentMap.addLayer({
          id: 'polygon-outline', type: 'line', source: 'polygon-source',
          paint: { 'line-color': '#000', 'line-width': 2 }
      });

      if (allFeatures.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        allFeatures.forEach(feature => {
          const coords = feature.geometry.coordinates;
          if (feature.geometry.type === 'Polygon') {
            coords[0].forEach(coord => bounds.extend(coord as mapboxgl.LngLatLike));
          } else if (feature.geometry.type === 'MultiPolygon') {
            coords.forEach(polygon => polygon[0].forEach(coord => bounds.extend(coord as mapboxgl.LngLatLike)));
          }
        });
        currentMap.fitBounds(bounds, { padding: 80, duration: 1500 });
      }
    } catch(err) {
      console.error("Ocorreu um erro ao carregar os polígonos: ", err);
    }
  };

  // Controle para rastrear se a mudança de pitch foi manual ou automática
  const [manualPitchChange, setManualPitchChange] = useState(false);
  
  useEffect(() => {
    if (!isMapLoaded || places.length === 0) return;
    if (selectedPlaces.length === 0) {
      setIsSpinning(false);
      // Apenas resetar a rotação quando nenhum local estiver selecionado
      // Removido: mudança automática de pitch para 0
    }
    
    const pathsToLoad = selectedPlaces
      .map(id => places.find(p => p.id === id)?.geoJsonPath)
      .filter((path): path is string => !!path);
    loadMultiplePolygons(pathsToLoad);
  }, [selectedPlaces, isMapLoaded, places]);
  
  useEffect(() => {
    const mapInstance = map.current;
    if (!isMapLoaded || !mapInstance) return;
    const layerId = 'highlighted-water';
    if (showWaterLayer && !mapInstance.getLayer(layerId)) {
      mapInstance.addLayer({
        'id': layerId, 'type': 'fill', 'source': 'composite',
        'source-layer': 'water', 'filter': ['==', '$type', 'Polygon'],
        'paint': { 'fill-color': '#00BFFF', 'fill-opacity': 0.7 }
      });
    } else if (!showWaterLayer && mapInstance.getLayer(layerId)) {
      mapInstance.removeLayer(layerId);
    }
  }, [showWaterLayer, isMapLoaded]);

  const handlePlaceChange = (event: SelectChangeEvent<typeof selectedPlaces>) => {
    const { target: { value } } = event;
    setIsSpinning(false);
    setSelectedPlaces(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleClear = () => {
    if (!map.current || !isMapLoaded) return;
    setSelectedPlaces([]);
    setIsSpinning(false);
    removePolygon();
    map.current?.flyTo({ center: [-50.0, -15.5], zoom: 3.5, pitch: 0, bearing: 0, duration: 2000 });
    setPitch(0);
  };

  const handlePitchChange = (event: React.MouseEvent<HTMLElement>, newPitch: number | null) => {
    if (newPitch !== null && map.current) {
      setManualPitchChange(true);
      setPitch(newPitch);
      
      // Sempre usar easeTo, mas com durações diferentes
      if (isSpinning) {
        map.current.easeTo({ pitch: newPitch, duration: 500 }); // Mais rápido durante rotação
      } else {
        map.current.easeTo({ pitch: newPitch, duration: 1000 }); // Mais suave quando parado
      }
      
      // Timeout ajustado para cada caso
      setTimeout(() => {
        setManualPitchChange(false);
      }, isSpinning ? 600 : 1100);
    }
  };

  const spinGlobe = useCallback(() => {
    const mapInstance = map.current;
    if (!mapInstance || manualPitchChange) return; // Parar rotação durante mudança manual
    const currentBearing = mapInstance.getBearing();
    mapInstance.setBearing(currentBearing + 0.1); // Rotação mais lenta
    animationFrameId.current = requestAnimationFrame(spinGlobe);
  }, [manualPitchChange]);

  useEffect(() => {
    if (isSpinning) {
      animationFrameId.current = requestAnimationFrame(spinGlobe);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isSpinning, spinGlobe]);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-49.27, -25.42], zoom: 10, pitch: 0, bearing: -17.6,
    });
    
    const resizeObserver = new ResizeObserver(() => map.current?.resize());
    resizeObserver.observe(mapContainer.current);

    map.current.on('load', () => {
      setIsMapLoaded(true);
      map.current?.addSource('mapbox-dem', {
        'type': 'raster-dem', 'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512, 'maxzoom': 14
      });
      map.current?.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    });

    return () => {
      resizeObserver.disconnect();
      map.current?.remove();
      map.current = null;
      setIsMapLoaded(false);
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <ThemeProvider theme={darkTheme}>
        
        {/* --- PAINEL DE FILTRO CENTRAL --- */}
        <Box 
          sx={{
            position: 'absolute', top: '10%', left: '50%',
            transform: 'translateX(-50%)', minWidth: 240, zIndex: 1,
            backgroundColor: 'rgba(46, 46, 46, 0.9)', backdropFilter: 'blur(10px)',
            color: 'white', padding: 2, borderRadius: 2
          }}>
          {!isMapLoaded && <CircularProgress size={24} color="inherit" sx={{ display: 'block', margin: 'auto' }} />}
          <FormControl fullWidth disabled={!isMapLoaded}>
            <InputLabel id="multiple-checkbox-label">Selecionar Local</InputLabel>
            <Select 
              labelId="multiple-checkbox-label"
              multiple value={selectedPlaces} onChange={handlePlaceChange}
              renderValue={(selected) => selected.map(id => places.find(p => p.id === id)?.name).join(', ')}
              label="Selecionar Local" >
              {places.map((place) => (
                <MenuItem key={place.id} value={place.id}>
                  <Checkbox checked={selectedPlaces.indexOf(place.id) > -1} />
                  <ListItemText primary={place.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* --- CONTAINER PARA OS CONTROLES DA DIREITA --- */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2, // Espaço entre as caixas de controle
          }}
        >
          {/* Caixa 1: Controles da Câmera */}
          <Box
            sx={{
              backgroundColor: 'rgba(46, 46, 46, 0.9)', backdropFilter: 'blur(10px)',
              padding: 1, borderRadius: 2, display: 'flex',
              flexDirection: 'column', gap: 1, alignItems: 'stretch',
            }}
          >
            <Button variant="contained" onClick={handleClear} disabled={!isMapLoaded} fullWidth>Resetar</Button>
            <FormControlLabel
              control={<Switch checked={isSpinning} onChange={() => setIsSpinning(!isSpinning)} disabled={!isMapLoaded || selectedPlaces.length === 0} />}
              label="Rotação" sx={{ justifyContent: 'space-between', ml: 0.5, color: 'rgba(255, 255, 255, 0.8)' }}
            />
            <ToggleButtonGroup orientation="vertical" value={pitch} exclusive onChange={handlePitchChange} disabled={!isMapLoaded} fullWidth >
              <ToggleButton value={0}>Visão 2D</ToggleButton>
              <ToggleButton value={30}>Visão 30°</ToggleButton>
              <ToggleButton value={60}>Visão 60°</ToggleButton>
              <ToggleButton value={75}>Visão 75°</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Caixa 2: Controles de Camadas (Lagos) */}
          <Box
            sx={{
              backgroundColor: 'rgba(46, 46, 46, 0.9)', backdropFilter: 'blur(10px)',
              padding: '4px 12px', borderRadius: 2,
            }}
          >
            <FormControlLabel
              control={<Switch checked={showWaterLayer} onChange={() => setShowWaterLayer(!showWaterLayer)} disabled={!isMapLoaded} />}
              label="Marcar Lagos" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            />
          </Box>
        </Box>

      </ThemeProvider>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}