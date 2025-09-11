'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Grid, Alert, useMediaQuery, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface DadosPressao {
  pressao: number;
  tendencia: 'subindo' | 'descendo' | 'estavel';
  qualidade: 'excelente' | 'boa' | 'regular' | 'ruim';
  timestamp: string;
}

export default function PressaoBarometricaPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [dados, setDados] = useState<DadosPressao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lon: number } | null>(null);

  const buscarDadosPressao = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular dados de pressão barométrica
      const pressaoAtual = 1013.25 + (Math.random() - 0.5) * 50;
      const pressaoAnterior = pressaoAtual + (Math.random() - 0.5) * 10;
      
      let tendencia: 'subindo' | 'descendo' | 'estavel';
      if (pressaoAtual > pressaoAnterior + 2) {
        tendencia = 'subindo';
      } else if (pressaoAtual < pressaoAnterior - 2) {
        tendencia = 'descendo';
      } else {
        tendencia = 'estavel';
      }
      
      let qualidade: 'excelente' | 'boa' | 'regular' | 'ruim';
      if (pressaoAtual > 1020) {
        qualidade = 'excelente';
      } else if (pressaoAtual > 1010) {
        qualidade = 'boa';
      } else if (pressaoAtual > 1000) {
        qualidade = 'regular';
      } else {
        qualidade = 'ruim';
      }
      
      const novosDados: DadosPressao = {
        pressao: pressaoAtual,
        tendencia,
        qualidade,
        timestamp: new Date().toISOString()
      };
      
      setDados(novosDados);
    } catch (err) {
      setError('Erro ao buscar dados de pressão barométrica');
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
          setError('Erro ao obter localização. Usando dados padrão.');
          // Usar coordenadas padrão (Curitiba)
          const defaultLat = -25.4284;
          const defaultLon = -49.2733;
          setLocalizacao({ lat: defaultLat, lon: defaultLon });
          buscarDadosPressao(defaultLat, defaultLon);
        }
      );
    } else {
      setError('Geolocalização não suportada pelo navegador');
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
        return <TrendingUp color="success" />;
      case 'descendo':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="info" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando dados de pressão...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pressão Barométrica
      </Typography>
      
      {dados && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pressão Atual
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4">
                    {dados.pressao.toFixed(1)} hPa
                  </Typography>
                  {getTendenciaIcon(dados.tendencia)}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tendência: {dados.tendencia}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Qualidade para Pesca
                </Typography>
                <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>
                  {dados.qualidade}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Baseado na pressão atual
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}