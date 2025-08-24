// src/app/pressao/page.tsx
'use client';

import { Box, Typography, Paper, Grid, Button, Slider, LinearProgress, Collapse, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MyLocationIcon from '@mui/icons-material/MyLocation';

export default function PressaoBarometricaPage() {
  const [pressaoData, setPressaoData] = useState({
    pressao: null,
    tendencia: null,
    local: 'Localização atual',
    loading: true,
    error: null,
    latitude: null,
    longitude: null
  });
  
  const [localizacaoStatus, setLocalizacaoStatus] = useState({
    solicitada: false,
    obtendo: false,
    erro: null
  });
  
  // Estado para controlar a exibição da análise para pesca
  const [mostrarAnalisePesca, setMostrarAnalisePesca] = useState(false);

  // Função para obter a localização do usuário
  const obterLocalizacao = () => {
    setLocalizacaoStatus({
      solicitada: true,
      obtendo: true,
      erro: null
    });
    
    if (!navigator.geolocation) {
      setLocalizacaoStatus({
        solicitada: true,
        obtendo: false,
        erro: 'Geolocalização não é suportada pelo seu navegador.'
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPressaoData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setLocalizacaoStatus({
          solicitada: true,
          obtendo: false,
          erro: null
        });
        buscarDadosPressao(latitude, longitude);
      },
      (error) => {
        setLocalizacaoStatus({
          solicitada: true,
          obtendo: false,
          erro: `Erro ao obter localização: ${error.message}`
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  
  // Função para buscar dados de pressão barométrica com base na localização
  const buscarDadosPressao = (latitude, longitude) => {
    setPressaoData(prev => ({ ...prev, loading: true, error: null }));
    
    // Em uma aplicação real, você usaria uma API de clima como OpenWeatherMap, WeatherAPI, etc.
    // Aqui estamos simulando uma chamada à API
    setTimeout(() => {
      // Simulação de pressão aleatória entre 990 e 1030 hPa
      const pressaoAleatoria = Math.floor(Math.random() * (1030 - 990 + 1)) + 990;
      const tendencias = ['subindo', 'descendo', 'estável'];
      const tendenciaAleatoria = tendencias[Math.floor(Math.random() * tendencias.length)];
      
      setPressaoData({
        pressao: pressaoAleatoria,
        tendencia: tendenciaAleatoria,
        local: `Sua localização (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        loading: false,
        error: null,
        latitude,
        longitude
      });
    }, 1500);
    
    // Implementação real com API (exemplo com OpenWeatherMap)
    // const API_KEY = 'SUA_API_KEY'; // Você precisaria de uma chave de API válida
    // fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`)
    //   .then(response => response.json())
    //   .then(data => {
    //     setPressaoData({
    //       pressao: data.main.pressure,
    //       tendencia: determinarTendencia(data.main.pressure),
    //       local: `${data.name}, ${data.sys.country}`,
    //       loading: false,
    //       error: null,
    //       latitude,
    //       longitude
    //     });
    //   })
    //   .catch(error => {
    //     setPressaoData(prev => ({ ...prev, loading: false, error: error.message }));
    //   });
  };
  
  useEffect(() => {
    // Carrega dados iniciais com uma localização padrão (Curitiba)
    const latitudePadrao = -25.428;
    const longitudePadrao = -49.273;
    
    buscarDadosPressao(latitudePadrao, longitudePadrao);
  }, []);

  // Função para determinar a cor baseada na pressão
  const getPressaoColor = (pressao) => {
    if (!pressao) return '#888';
    if (pressao < 1000) return '#d32f2f'; // Baixa pressão - vermelho
    if (pressao > 1020) return '#2e7d32'; // Alta pressão - verde
    return '#1976d2'; // Pressão normal - azul
  };

  // Função para obter descrição da pressão
  const getPressaoDescricao = (pressao) => {
    if (!pressao) return 'Desconhecida';
    if (pressao < 1000) return 'Baixa - Possibilidade de chuva ou tempestade';
    if (pressao > 1020) return 'Alta - Geralmente indica tempo estável e seco';
    return 'Normal - Condições atmosféricas estáveis';
  };
  
  // Função para avaliar a qualidade da pressão para pesca
  const getQualidadePesca = (pressao) => {
    if (!pressao) return { texto: 'Desconhecida', valor: 50 };
    
    // Valores de referência para pesca
    // 990-1000: Ruim (tempestades)
    // 1000-1009: Moderada a Boa (peixes mais ativos antes de tempestades)
    // 1009-1015: Excelente (pressão estável, condições ideais)
    // 1015-1022: Boa (tempo estável)
    // 1022-1030: Moderada (muito estável, peixes menos ativos)
    
    if (pressao < 995) return { texto: 'Ruim - Tempestades prováveis', valor: 10 };
    if (pressao < 1000) return { texto: 'Fraca - Condições instáveis', valor: 30 };
    if (pressao < 1005) return { texto: 'Moderada - Peixes mais ativos antes de mudanças', valor: 60 };
    if (pressao < 1010) return { texto: 'Boa - Condições favoráveis', valor: 80 };
    if (pressao < 1015) return { texto: 'Excelente - Condições ideais', valor: 100 };
    if (pressao < 1020) return { texto: 'Muito Boa - Tempo estável', valor: 90 };
    if (pressao < 1025) return { texto: 'Boa - Estabilidade atmosférica', valor: 70 };
    return { texto: 'Moderada - Muito estável, peixes menos ativos', valor: 50 };
  };
  
  // Função para obter a cor da escala de qualidade
  const getQualidadeColor = (valor) => {
    if (valor < 30) return '#d32f2f'; // Ruim - vermelho
    if (valor < 60) return '#ff9800'; // Moderada - laranja
    if (valor < 80) return '#ffeb3b'; // Boa - amarelo
    if (valor < 90) return '#4caf50'; // Muito boa - verde
    return '#2e7d32'; // Excelente - verde escuro
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      padding: 3,
      backgroundColor: '#e0f7fa',
      backgroundImage: 'linear-gradient(to bottom, #bbdefb, #e3f2fd)',
      minHeight: '100vh',
      position: 'relative' // Adicionado para posicionamento absoluto do botão
    }}>
      {/* Título centralizado com container próprio */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%', 
        mb: 3,
        position: 'relative'
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          color: '#003366', 
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(255,255,255,0.7)'
        }}>
          Pressão Barométrica
        </Typography>
      </Box>
      
      {localizacaoStatus.erro && (
        <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#ffebee' }}>
          <Typography color="error">{localizacaoStatus.erro}</Typography>
        </Paper>
      )}
      
      <Typography variant="subtitle1" gutterBottom align="center">
        {pressaoData.local}
      </Typography>
      
      {/* Botão de localização posicionado no canto inferior direito */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 10 
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<MyLocationIcon />}
          onClick={obterLocalizacao}
          disabled={localizacaoStatus.obtendo}
          sx={{ 
            backgroundColor: '#4a754a', 
            '&:hover': { backgroundColor: '#3e623e'},
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          {localizacaoStatus.obtendo ? 'Obtendo localização...' : 'Usar minha localização'}
        </Button>
      </Box>

      {pressaoData.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Box sx={{ width: '50%' }}>
            <Typography align="center" gutterBottom>Carregando dados de pressão...</Typography>
            <LinearProgress color="primary" />
          </Box>
        </Box>
      ) : pressaoData.error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography color="error">Erro ao carregar dados: {pressaoData.error}</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper elevation={3} sx={{ 
              p: 3, 
              width: '100%',
              maxWidth: '800px',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#e3f2fd',
              backgroundImage: 'linear-gradient(to bottom, #bbdefb, #e3f2fd)',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 105, 192, 0.15)'
            }}>
              <Typography variant="h6" gutterBottom align="center" sx={{ width: '100%' }}>Leitura Atual</Typography>
              
              {/* Escala de qualidade para pesca */}
              {pressaoData.pressao && (
                <Box sx={{ width: '100%', mt: 3 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Qualidade para Pesca
                  </Typography>
                  
                  {/* Leitura atual centralizada com a escala */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        color: getPressaoColor(pressaoData.pressao),
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {pressaoData.pressao} hPa
                    </Typography>
                  </Box>
                  
                  {/* Valor e descrição da qualidade */}
                  <Typography 
                    variant="h5" 
                    align="center" 
                    sx={{ 
                      color: getQualidadeColor(getQualidadePesca(pressaoData.pressao).valor),
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {getQualidadePesca(pressaoData.pressao).texto}
                  </Typography>
                  
                  {/* Escala visual */}
                  <Box sx={{ px: 2, py: 1 }}>
                    <Slider
                      value={getQualidadePesca(pressaoData.pressao).valor}
                      min={0}
                      max={100}
                      step={1}
                      disabled
                      sx={{
                        '& .MuiSlider-thumb': {
                          height: 24,
                          width: 24,
                          backgroundColor: '#fff',
                          border: '2px solid currentColor',
                        },
                        '& .MuiSlider-track': {
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: getQualidadeColor(getQualidadePesca(pressaoData.pressao).valor),
                        },
                        '& .MuiSlider-rail': {
                          height: 10,
                          borderRadius: 5,
                          opacity: 0.5,
                          backgroundColor: '#bfbfbf',
                        },
                        '& .MuiSlider-mark': {
                          backgroundColor: '#bfbfbf',
                          height: 8,
                          width: 2,
                          marginTop: -3,
                        },
                      }}
                      marks={[
                        { value: 0, label: 'Ruim' },
                        { value: 25, label: 'Fraca' },
                        { value: 50, label: 'Moderada' },
                        { value: 75, label: 'Boa' },
                        { value: 100, label: 'Excelente' },
                      ]}
                    />
                  </Box>
                  
                  {/* Anotações movidas para baixo da escala com botão para análise de pesca */}
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2, color: '#000' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#000' }}>
                        Tendência: <strong>{pressaoData.tendencia}</strong>
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setMostrarAnalisePesca(!mostrarAnalisePesca)}
                        endIcon={mostrarAnalisePesca ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        sx={{ 
                          backgroundColor: '#1976d2',
                          '&:hover': { backgroundColor: '#1565c0' },
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        Análise para Pesca
                      </Button>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#000', mt: 1 }}>
                      {getPressaoDescricao(pressaoData.pressao)}
                    </Typography>
                    
                    {/* Conteúdo expansível com análise para pesca */}
                    <Collapse in={mostrarAnalisePesca} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(225, 245, 254, 0.9)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          A pressão barométrica é um indicador importante para prever condições de pesca. 
                          Mudanças na pressão podem afetar o comportamento dos peixes:
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          <ul>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão entre 1009-1015 hPa:</strong> Condições ideais para pesca, estabilidade atmosférica
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão entre 1000-1009 hPa:</strong> Peixes tendem a se alimentar mais antes de mudanças climáticas
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão abaixo de 1000 hPa:</strong> Indica tempestades e condições desfavoráveis
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão acima de 1020 hPa:</strong> Muito estável, peixes podem ficar menos ativos
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Tendência:</strong> Mudanças na pressão são mais importantes que o valor absoluto
                              </Typography>
                            </li>
                          </ul>
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Análise para pesca movida para o rodapé */}

          {/* Mapa Windy removido */}
          
          {/* Rodapé removido, conteúdo movido para o botão expansível */}
        </Grid>
      )}
      {/* Espaço adicional no final da página para evitar que o conteúdo seja cortado */}
      <Box sx={{ height: '80px' }} />
    </Box>
  );
}