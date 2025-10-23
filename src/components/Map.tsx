// src/components/Map.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  createTheme,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { apiService } from '@/services/api';
import { useSidebar } from '@/context/SidebarContext';
import FilterListIcon from '@mui/icons-material/FilterList';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

interface Place {
  name: string;
  id: string;
  geoJsonPath: string;
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [pitch, setPitch] = useState(0);
  const [showWaterLayer, setShowWaterLayer] = useState(false);
  const [manualPitchChange, setManualPitchChange] = useState(false);
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);
  
  // Usar o contexto da sidebar para detectar mudanças
  const { isSidebarOpen } = useSidebar();

  // Responsividade e estado de filtros retráteis
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [controlsOpen, setControlsOpen] = useState(true);
  useEffect(() => {
    setControlsOpen(!isMobile);
  }, [isMobile]);

  // Carregar configurações do backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await apiService.getPublicConfig();
        if (config.mapbox?.accessToken) {
          mapboxgl.accessToken = config.mapbox.accessToken;
          setConfigLoaded(true);
        } else {
          console.error('Token do Mapbox não encontrado na configuração');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadConfig();
  }, []);

  // Carregar locais disponíveis
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response = await fetch('/data/locations.json');
        const data = await response.json();
        
        // Extrair todos os locais da estrutura hierárquica
        const allPlaces: Place[] = [];
        
        // Adicionar países
        if (data.countries) {
          data.countries.forEach((country: any) => {
            allPlaces.push({
              name: country.name,
              id: country.id,
              geoJsonPath: country.geoJsonPath
            });
            
            // Adicionar estados
            if (country.states) {
              country.states.forEach((state: any) => {
                allPlaces.push({
                  name: state.name,
                  id: state.id,
                  geoJsonPath: state.geoJsonPath
                });
                
                // Adicionar cidades
                if (state.cities) {
                  state.cities.forEach((city: any) => {
                    allPlaces.push({
                      name: city.name,
                      id: city.id,
                      geoJsonPath: city.geoJsonPath
                    });
                  });
                }
              });
            }
          });
        }
        
        setPlaces(allPlaces);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
      }
    };

    loadPlaces();
  }, []);

  // Redimensionar mapa quando sidebar abre/fecha
  useEffect(() => {
    if (map.current) {
      const timer = setTimeout(() => {
        map.current?.resize();
      }, 300); // Aguarda a animação da sidebar terminar

      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  const handlePlaceChange = (event: SelectChangeEvent<typeof selectedPlaces>) => {
    const value = event.target.value;
    setSelectedPlaces(typeof value === 'string' ? value.split(',') : value);
  };

  const handleClear = () => {
    setSelectedPlaces([]);
    if (map.current) {
      const sources = map.current.getStyle().sources;
      Object.keys(sources).forEach(sourceId => {
        if (sourceId.startsWith('place-')) {
          if (map.current?.getLayer(`${sourceId}-fill`)) {
            map.current.removeLayer(`${sourceId}-fill`);
          }
          if (map.current?.getLayer(`${sourceId}-line`)) {
            map.current.removeLayer(`${sourceId}-line`);
          }
          if (map.current?.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }
        }
      });
    }
  };

  const handlePitchChange = (event: React.MouseEvent<HTMLElement>, newPitch: number | null) => {
    if (newPitch !== null && map.current) {
      setPitch(newPitch);
      setManualPitchChange(true);
      map.current.easeTo({ pitch: newPitch, duration: 1000 });
      setTimeout(() => setManualPitchChange(false), 1100);
    }
  };

  // Função para resetar o mapa
  const resetMap = () => {
    if (!map.current) return;
    
    map.current.easeTo({
      center: [-54.0, -15.0], // Centro do Brasil
      zoom: 4,
      pitch: 0,
      bearing: 0,
      duration: 1500
    });
    
    setPitch(0);
  };

  // Função para calcular o centro e bounds de um GeoJSON
  const calculateBounds = (geoJsonData: any) => {
    const coordinates = geoJsonData.features[0].geometry.coordinates[0];
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    coordinates.forEach(([lng, lat]: [number, number]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    return {
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [number, number],
      bounds: [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]]
    };
  };

  // Carregar GeoJSON quando lugares são selecionados
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    let isCancelled = false;
    const timeoutId = setTimeout(async () => {
      if (isCancelled) return;

      const loadSelectedPlaces = async () => {
        if (!map.current || isCancelled) return;

        // Coletar sources atuais
        const currentSources = new Set<string>();
        try {
          const style = map.current.getStyle();
          if (style?.sources) {
            Object.keys(style.sources).forEach(sourceId => {
              if (sourceId.startsWith('place-')) {
                currentSources.add(sourceId);
              }
            });
          }
        } catch (error) {
          // Ignorar erros de estilo durante transições
          return;
        }

        // Remover sources não utilizados
        for (const sourceId of currentSources) {
          if (isCancelled) return;
          
          const placeId = sourceId.replace('place-', '');
          if (!selectedPlaces.includes(placeId)) {
            try {
              if (map.current?.getLayer(`${sourceId}-fill`)) {
                map.current.removeLayer(`${sourceId}-fill`);
              }
              if (map.current?.getLayer(`${sourceId}-line`)) {
                map.current.removeLayer(`${sourceId}-line`);
              }
              if (map.current?.getSource(sourceId)) {
                map.current.removeSource(sourceId);
              }
            } catch (error) {
              // Ignorar erros durante remoção
            }
          }
        }

        // Adicionar novos sources
        for (const placeId of selectedPlaces) {
          if (isCancelled) return;
          
          const place = places.find(p => p.id === placeId);
          if (!place) continue;

          const sourceId = `place-${placeId}`;
          
          // Verificação tripla para evitar duplicatas
          try {
            if (map.current?.getSource(sourceId)) continue;
          } catch (error) {
            // Source pode não existir ainda
          }

          try {
            const response = await fetch(place.geoJsonPath);
            if (isCancelled) return;
            
            const geoJsonData = await response.json();
            if (isCancelled) return;
            
            // Verificar novamente antes de adicionar
            if (map.current && !map.current.getSource(sourceId)) {
              map.current.addSource(sourceId, {
                type: 'geojson',
                data: geoJsonData
              });

              map.current.addLayer({
                id: `${sourceId}-fill`,
                type: 'fill',
                source: sourceId,
                paint: {
                  'fill-color': '#7CB342',
                  'fill-opacity': 0.3
                }
              });

              map.current.addLayer({
                id: `${sourceId}-line`,
                type: 'line',
                source: sourceId,
                paint: {
                  'line-color': '#7CB342',
                  'line-width': 2
                }
              });

              // Calcular bounds
              const bounds = calculateBounds(geoJsonData);
              if (bounds && map.current) {
                map.current.fitBounds(bounds.bounds, {
                  padding: 50,
                  duration: 1500
                });
              }
            }
          } catch (error) {
            console.error(`Erro ao carregar GeoJSON para ${place.name}:`, error);
          }
        }
      };

      await loadSelectedPlaces();
    }, 100); // Debounce de 100ms

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [selectedPlaces, places, isMapLoaded]);
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    if (!configLoaded) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-54.0, -15.0], // Centro aproximado do Brasil
      zoom: 4, // Zoom mais amplo para mostrar o Brasil inteiro
      pitch: 0, 
      bearing: 0,
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
  }, [configLoaded]);


  // Efeito para controlar a camada de água
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (showWaterLayer) {
      // Verificar se o source já existe
      if (!map.current.getSource('water-source')) {
        map.current.addSource('water-source', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8'
        });
      }

      // Verificar se a layer já existe
      if (!map.current.getLayer('water-layer')) {
        map.current.addLayer({
          id: 'water-layer',
          type: 'fill',
          source: 'water-source',
          'source-layer': 'water',
          paint: {
            'fill-color': '#4A90E2',
            'fill-opacity': 0.6
          }
        });
      }
    } else {
      // Remover layer primeiro
      if (map.current.getLayer('water-layer')) {
        map.current.removeLayer('water-layer');
      }
      // Depois remover source
      if (map.current.getSource('water-source')) {
        map.current.removeSource('water-source');
      }
    }
  }, [showWaterLayer, isMapLoaded]);

  // Limpar animação quando componente desmonta
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);


  return (
    <div style={{ 
      position: 'relative', 
      height: '100vh', 
      width: '100%',
      overflow: 'hidden'
    }}>
      <ThemeProvider theme={darkTheme}>
        {/* Botão para retrair/expandir filtros (mobile) */}
        <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1100 }}>
          <IconButton 
            aria-label="alternar filtros" 
            onClick={() => setControlsOpen(prev => !prev)}
            sx={{
              backgroundColor: 'rgba(46, 46, 46, 0.7)',
              backdropFilter: 'blur(15px)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(46, 46, 46, 0.8)' },
              display: { xs: 'inline-flex', md: 'none' }
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        {/* PAINEL DE SELEÇÃO DE LOCAL - CENTRALIZADO NO TOPO */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            minWidth: { xs: 220, sm: 280, md: 300 },
            maxWidth: { xs: 260, sm: 340, md: 400 },
          }}
        >
          <Box 
            sx={{
              backgroundColor: 'rgba(46, 46, 46, 0.7)', 
              backdropFilter: 'blur(15px)',
              color: 'white', 
              padding: 2, 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {!isMapLoaded && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CircularProgress size={24} color="inherit" />
              </Box>
            )}
            <FormControl fullWidth disabled={!isMapLoaded}>
              <InputLabel id="multiple-checkbox-label" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Selecionar Local
              </InputLabel>
              <Select 
                labelId="multiple-checkbox-label"
                multiple 
                value={selectedPlaces} 
                onChange={handlePlaceChange}
                renderValue={(selected) => selected.map(id => places.find(p => p.id === id)?.name).join(', ')}
                label="Selecionar Local"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#7CB342',
                  },
                }}
              >
                {places.map((place) => (
                  <MenuItem key={place.id} value={place.id}>
                    <Checkbox checked={selectedPlaces.indexOf(place.id) > -1} />
                    <ListItemText primary={place.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* CONTROLES LATERAIS DIREITOS (retráteis) */}
        {controlsOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              right: 20,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxWidth: { xs: 180, md: 200 },
            }}
          >
            {/* Controles da Câmera */}
            <Box
              sx={{
                backgroundColor: 'rgba(46, 46, 46, 0.7)', 
                backdropFilter: 'blur(15px)',
                padding: 2, 
                borderRadius: 2, 
                display: 'flex',
                flexDirection: 'column', 
                gap: 1.5,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#7CB342', fontWeight: 'bold', textAlign: 'center' }}>
                Controles da Câmera
              </Typography>
              
              <Button 
                variant="contained" 
                onClick={resetMap} 
                disabled={!isMapLoaded}
                sx={{
                  backgroundColor: '#7CB342',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#689F38',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: 'rgba(255, 255, 255, 0.26)',
                  },
                  fontSize: '0.875rem',
                  padding: '8px 16px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Resetar
              </Button>
              
              <ToggleButtonGroup 
                orientation="vertical" 
                value={pitch} 
                exclusive 
                onChange={handlePitchChange} 
                disabled={!isMapLoaded} 
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    color: 'rgba(255,255,255,0.8)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                  },
                  '& .MuiToggleButton-root.Mui-selected': {
                    backgroundColor: '#7CB342',
                    color: 'white',
                  },
                }}
              >
                <ToggleButton value={0}>Visão 2D</ToggleButton>
                <ToggleButton value={30}>Visão 30°</ToggleButton>
                <ToggleButton value={60}>Visão 60°</ToggleButton>
                <ToggleButton value={75}>Visão 75°</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Controles de Camadas */}
            <Box
              sx={{
                backgroundColor: 'rgba(46, 46, 46, 0.7)', 
                backdropFilter: 'blur(15px)',
                padding: 2, 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#7CB342', fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                Camadas
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={showWaterLayer} 
                    onChange={() => setShowWaterLayer(!showWaterLayer)} 
                    disabled={!isMapLoaded}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#7CB342',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#7CB342',
                      },
                    }}
                  />
                }
                label="Marcar Lagos" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  ml: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>
        </Box>
        )}
        
        </ThemeProvider>
      
        <div 
          ref={mapContainer} 
          style={{ 
            height: '100%', 
            width: '100%',
            position: 'relative',
            zIndex: 1
          }} 
        />
      </div>
    );
}