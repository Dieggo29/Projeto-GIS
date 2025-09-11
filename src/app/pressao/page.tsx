'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Alert, 
  useMediaQuery, 
  useTheme, 
  Container,
  CircularProgress
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface DadosPressao {
  pressao: number;
  tendencia: 'subindo' | 'descendo' | 'estavel';
  qualidade: 'excelente' | 'boa' | 'regular' | 'ruim';
  timestamp: string;
  local: string;
}

export default function PressaoBarometricaPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [dados, setDados] = useState<DadosPressao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lon: number } | null>(null);

  const determinarTendencia = (pressao: number): 'subindo' | 'descendo' | 'estavel' => {
    if (pressao < 1000) return 'descendo';
    if (pressao > 1020) return 'subindo';
    return 'estavel';
  };

  const determinarQualidade = (pressao: number): 'excelente' | 'boa' | 'regular' | 'ruim' => {
    if (pressao > 1020) return 'excelente';
    if (pressao > 1010) return 'boa';
    if (pressao > 1000) return 'regular';
    return 'ruim';
  };

  const buscarDadosPressao = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('Chave da API OpenWeatherMap não configurada. Configure NEXT_PUBLIC_OPENWEATHER_API_KEY no arquivo .env.local');
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const pressaoAtual = data.main.pressure;
      
      const novosDados: DadosPressao = {
        pressao: pressaoAtual,
        tendencia: determinarTendencia(pressaoAtual),
        qualidade: determinarQualidade(pressaoAtual),
        timestamp: new Date().toISOString(),
        local: `${data.name}, ${data.sys.country}`
      };
      
      setDados(novosDados);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados de pressão barométrica');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const obterLocalizacao = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocalizacao({ lat: latitude, lon: longitude });
          buscarDadosPressao(latitude, longitude);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setError('Erro ao obter localização. Usando coordenadas de Curitiba.');
          // Usar coordenadas padrão (Curitiba)
          const defaultLat = -25.4284;
          const defaultLon = -49.2733;
          setLocalizacao({ lat: defaultLat, lon: defaultLon });
          buscarDadosPressao(defaultLat, defaultLon);
        }
      );
    } else {
      setError('Geolocalização não suportada pelo navegador. Usando coordenadas de Curitiba.');
      // Usar coordenadas padrão
      const defaultLat = -25.4284;
      const defaultLon = -49.2733;
      setLocalizacao({ lat: defaultLat, lon: defaultLon });
      buscarDadosPressao(defaultLat, defaultLon);
    }
  }, [buscarDadosPressao]);

  useEffect(() => {
    obterLocalizacao();
  }, [obterLocalizacao]);

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo':
        return <TrendingUp sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.9)' }} />;
      case 'descendo':
        return <TrendingDown sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.9)' }} />;
      default:
        return <TrendingFlat sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.9)' }} />;
    }
  };

  const getTendenciaText = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo':
        return 'Em alta';
      case 'descendo':
        return 'Em queda';
      default:
        return 'Estável';
    }
  };

  const getQualidadeColor = (qualidade: string) => {
    switch (qualidade) {
      case 'excelente':
        return '#4caf50';
      case 'boa':
        return '#8bc34a';
      case 'regular':
        return '#ff9800';
      case 'ruim':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center'
        }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Carregando dados reais de pressão barométrica...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Obtendo dados da API OpenWeatherMap
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && !dados) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Verifique se a chave da API OpenWeatherMap está configurada corretamente.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Pressão Barométrica
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {dados && (
        <Grid container spacing={3} justifyContent="center">
          {/* Card Principal - Pressão Atual */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                  Pressão Atual
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                  {dados.local}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 2,
                  mb: 2
                }}>
                  <Typography 
                    variant="h2" 
                    component="div"
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                  >
                    {dados.pressao.toFixed(1)}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      hPa
                    </Typography>
                    {getTendenciaIcon(dados.tendencia)}
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Tendência: {getTendenciaText(dados.tendencia)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  Atualizado: {new Date(dados.timestamp).toLocaleTimeString('pt-BR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Card Qualidade para Pesca */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Qualidade para Pesca
                </Typography>
                <Typography 
                  variant="h3" 
                  component="div"
                  sx={{ 
                    textTransform: 'capitalize',
                    color: getQualidadeColor(dados.qualidade),
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: { xs: '2rem', md: '3rem' }
                  }}
                >
                  {dados.qualidade}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Baseado na pressão atmosférica atual
                </Typography>
                
                {/* Barra de Progresso */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: 8, 
                    backgroundColor: '#e0e0e0', 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      width: dados.qualidade === 'excelente' ? '100%' : 
                             dados.qualidade === 'boa' ? '75%' :
                             dados.qualidade === 'regular' ? '50%' : '25%',
                      height: '100%',
                      backgroundColor: getQualidadeColor(dados.qualidade),
                      transition: 'width 0.3s ease'
                    }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Informações Adicionais */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  Informações sobre Pressão Barométrica
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Pressão Normal
                      </Typography>
                      <Typography variant="h6">
                        1013.25 hPa
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Alta Pressão
                      </Typography>
                      <Typography variant="h6">
                        {'>'}1020 hPa
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Baixa Pressão
                      </Typography>
                      <Typography variant="h6">
                        {'<'}1000 hPa
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Localização
                      </Typography>
                      <Typography variant="body1">
                        {localizacao ? 
                          `${localizacao.lat.toFixed(2)}°, ${localizacao.lon.toFixed(2)}°` : 
                          'Não disponível'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}