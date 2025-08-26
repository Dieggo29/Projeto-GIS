'use client';

import { Box, Typography, LinearProgress, Card, CardContent, Grid } from '@mui/material';
import { useEffect, useState } from 'react';

interface AtividadePeixesData {
  atividade: number; // 0-100
  qualidade: string;
  fatores: {
    pressao: { valor: number; impacto: string; peso: number };
    temperatura: { valor: number; impacto: string; peso: number };
    vento: { valor: number; impacto: string; peso: number };
    clima: { condicao: string; impacto: string; peso: number };
  };
  local: string;
  loading: boolean;
  error: string | null;
}

interface DadosMultiplosDias {
  [key: string]: AtividadePeixesData; // key = 'YYYY-MM-DD'
}

export default function AtividadePeixesPage() {
  const [dadosMultiplosDias, setDadosMultiplosDias] = useState<DadosMultiplosDias>({});
  const [diaSelecionado, setDiaSelecionado] = useState(0); // 0 = hoje
  const [loading, setLoading] = useState(true);
  const [local, setLocal] = useState('Carregando localização...');
  const [error, setError] = useState<string | null>(null);
  
  // Estado para compatibilidade com código existente
  const [dadosAtividade, setDadosAtividade] = useState<AtividadePeixesData>({
    atividade: 0,
    qualidade: 'Carregando...',
    fatores: {
      pressao: { valor: 0, impacto: 'neutro', peso: 0 },
      temperatura: { valor: 0, impacto: 'neutro', peso: 0 },
      vento: { valor: 0, impacto: 'neutro', peso: 0 },
      clima: { condicao: 'limpo', impacto: 'neutro', peso: 0 }
    },
    local: 'Carregando...',
    loading: true,
    error: null
  });

  // Sincronizar dadosAtividade com o dia selecionado
  useEffect(() => {
    const hoje = new Date();
    const diasOffset = diaSelecionado;
    const dataKey = new Date(hoje.getTime() + (diasOffset * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0];
    
    if (dadosMultiplosDias[dataKey]) {
      setDadosAtividade(dadosMultiplosDias[dataKey]);
    }
  }, [diaSelecionado, dadosMultiplosDias]);

  // Função para calcular atividade de pesca (APENAS COM DADOS REAIS)
  const calcularAtividadePesca = (dados: any) => {
    const pressao = dados.main.pressure;
    const temperatura = dados.main.temp;
    const vento = dados.wind.speed;
    const clima = dados.weather[0].main;
    
    let pontuacao = 50; // Base neutra
    
    // Pressão atmosférica (ideal: 1013-1020 mb)
    if (pressao >= 1013 && pressao <= 1020) {
      pontuacao += 15;
    } else if (pressao < 1000 || pressao > 1030) {
      pontuacao -= 15;
    }
    
    // Temperatura (ideal: 15-25°C)
    if (temperatura >= 15 && temperatura <= 25) {
      pontuacao += 10;
    } else if (temperatura < 5 || temperatura > 35) {
      pontuacao -= 10;
    }
    
    // Vento (ideal: 5-15 km/h)
    if (vento >= 1.4 && vento <= 4.2) { // 5-15 km/h em m/s
      pontuacao += 10;
    } else if (vento > 8.3) { // > 30 km/h
      pontuacao -= 15;
    }
    
    // Condições climáticas
    switch (clima) {
      case 'Clear':
        pontuacao += 15;
        break;
      case 'Clouds':
        pontuacao += 5;
        break;
      case 'Rain':
        pontuacao -= 10;
        break;
      case 'Thunderstorm':
        pontuacao -= 20;
        break;
    }
    
    return Math.max(0, Math.min(100, pontuacao));
  };

  // Função para buscar dados da API (APENAS DADOS REAIS)
  const buscarDadosAtividade = async (latitude: number, longitude: number): Promise<AtividadePeixesData> => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados meteorológicos');
      }
      
      const dados = await response.json();
      const atividade = calcularAtividadePesca(dados);
      
      let qualidade = 'BAIXA';
      if (atividade >= 75) qualidade = 'EXCELENTE';
      else if (atividade >= 50) qualidade = 'BOA';
      else if (atividade >= 25) qualidade = 'REGULAR';
      
      const dadosCompletos: AtividadePeixesData = {
        atividade,
        qualidade,
        fatores: {
          pressao: { 
            valor: dados.main.pressure, 
            impacto: dados.main.pressure >= 1013 && dados.main.pressure <= 1020 ? 'positivo' : 'negativo',
            peso: 0.3
          },
          temperatura: { 
            valor: dados.main.temp, 
            impacto: dados.main.temp >= 15 && dados.main.temp <= 25 ? 'positivo' : 'negativo',
            peso: 0.2
          },
          vento: { 
            valor: dados.wind.speed, 
            impacto: dados.wind.speed >= 1.4 && dados.wind.speed <= 4.2 ? 'positivo' : 'negativo',
            peso: 0.2
          },
          clima: { 
            condicao: dados.weather[0].main, 
            impacto: dados.weather[0].main === 'Clear' ? 'positivo' : 'negativo',
            peso: 0.3
          }
        },
        local: `${dados.name}, ${dados.sys.country}`,
        loading: false,
        error: null
      };
      
      return dadosCompletos;
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error; // Propagar erro em vez de retornar dados simulados
    }
  };

  // Função para buscar dados de múltiplos dias (APENAS DADOS REAIS DA API)
  const buscarDadosMultiplosDias = async (latitude: number, longitude: number) => {
    setLoading(true);
    const novosDados: DadosMultiplosDias = {};
    
    try {
      // Buscar dados atuais (hoje)
      const dadosHoje = await buscarDadosAtividade(latitude, longitude);
      const hoje = new Date().toISOString().split('T')[0];
      novosDados[hoje] = dadosHoje;
      
      // Buscar dados de previsão (3 dias futuros) - APENAS DA API
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (response.ok) {
        const dados = await response.json();
        
        for (let i = 1; i <= 3; i++) {
          const data = new Date();
          data.setDate(data.getDate() + i);
          const dataKey = data.toISOString().split('T')[0];
          
          const dadosDia = dados.list.filter((item: any) => 
            item.dt_txt.startsWith(dataKey)
          );
          
          if (dadosDia.length > 0) {
            const dadosEscolhidos = dadosDia.find((item: any) => 
              item.dt_txt.includes('12:00:00')
            ) || dadosDia[0];
            
            const atividade = calcularAtividadePesca(dadosEscolhidos);
            
            let qualidade = 'BAIXA';
            if (atividade >= 75) qualidade = 'EXCELENTE';
            else if (atividade >= 50) qualidade = 'BOA';
            else if (atividade >= 25) qualidade = 'REGULAR';
            
            novosDados[dataKey] = {
              atividade,
              qualidade,
              fatores: {
                pressao: { 
                  valor: dadosEscolhidos.main.pressure, 
                  impacto: dadosEscolhidos.main.pressure >= 1013 && dadosEscolhidos.main.pressure <= 1020 ? 'positivo' : 'negativo',
                  peso: 0.3
                },
                temperatura: { 
                  valor: dadosEscolhidos.main.temp, 
                  impacto: dadosEscolhidos.main.temp >= 15 && dadosEscolhidos.main.temp <= 25 ? 'positivo' : 'negativo',
                  peso: 0.2
                },
                vento: { 
                  valor: dadosEscolhidos.wind.speed, 
                  impacto: dadosEscolhidos.wind.speed >= 1.4 && dadosEscolhidos.wind.speed <= 4.2 ? 'positivo' : 'negativo',
                  peso: 0.2
                },
                clima: { 
                  condicao: dadosEscolhidos.weather[0].main, 
                  impacto: dadosEscolhidos.weather[0].main === 'Clear' ? 'positivo' : 'negativo',
                  peso: 0.3
                }
              },
              local: `${dados.city.name}, ${dados.city.country}`,
              loading: false,
              error: null
            };
          }
        }
      }
      
      setDadosMultiplosDias(novosDados);
      
      // Definir dados do dia atual
      if (novosDados[hoje]) {
        setDadosAtividade(novosDados[hoje]);
        setLocal(novosDados[hoje].local);
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados de múltiplos dias:', error);
      setError('Erro ao carregar dados meteorológicos');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter localização
  const obterLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          buscarDadosMultiplosDias(latitude, longitude);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          // Usar coordenadas padrão (Curitiba)
          buscarDadosMultiplosDias(-25.4284, -49.2733);
        }
      );
    } else {
      // Usar coordenadas padrão (Curitiba)
      buscarDadosMultiplosDias(-25.4284, -49.2733);
    }
  };

  useEffect(() => {
    obterLocalizacao();
  }, []);

  // Função para formatar condição climática
  const formatarCondicaoClimatica = (condicao: string) => {
    const condicoes: { [key: string]: string } = {
      'Clear': '☀️ Céu Limpo',
      'Clouds': '☁️ Nublado',
      'Rain': '🌧️ Chuva',
      'Thunderstorm': '⛈️ Tempestade',
      'Snow': '❄️ Neve',
      'Mist': '🌫️ Neblina',
      'Fog': '🌫️ Névoa'
    };
    return condicoes[condicao] || `🌤️ ${condicao}`;
  };

  // Função para obter cor do impacto
  const obterCorImpacto = (impacto: string) => {
    switch (impacto) {
      case 'positivo': return '#4caf50';
      case 'negativo': return '#f44336';
      default: return '#ff9800';
    }
  };

  // Calendário (APENAS DIAS COM DADOS REAIS)
  const diasCalendario = [];
  const hoje = new Date();
  
  // Adicionar apenas hoje e dias futuros com dados reais
  for (let i = 0; i <= 3; i++) {
    const data = new Date(hoje.getTime() + (i * 24 * 60 * 60 * 1000));
    const dataKey = data.toISOString().split('T')[0];
    const dadosDia = dadosMultiplosDias[dataKey];
    
    // Só adicionar se tiver dados reais
    if (dadosDia) {
      diasCalendario.push({
        data: data.getDate(),
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
        isHoje: i === 0,
        atividade: dadosDia.atividade,
        qualidade: dadosDia.qualidade,
        loading: false,
        index: i
      });
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      py: 2,
      px: 2
    }}>
      {/* Título */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Atividade de peixes
        </Typography>
      </Box>

      {/* Calendário (APENAS DIAS COM DADOS REAIS) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {diasCalendario.map((item, index) => (
            <Box
              key={index}
              onClick={() => setDiaSelecionado(item.index)}
              sx={{
                textAlign: 'center',
                p: 1.5,
                minWidth: 60,
                height: 80,
                borderRadius: 2,
                cursor: 'pointer',
                backgroundColor: diaSelecionado === item.index ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                boxShadow: diaSelecionado === item.index ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: diaSelecionado === item.index ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: diaSelecionado === item.index ? '#1e3c72' : 'white', 
                  fontWeight: 'bold',
                  lineHeight: 1
                }}
              >
                {item.data}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: diaSelecionado === item.index ? '#1e3c72' : 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  lineHeight: 1,
                  mt: 0.5
                }}
              >
                {item.diaSemana}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Localização */}
      <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
        📍 {dadosAtividade.local}
      </Typography>

      {dadosAtividade.loading || loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography sx={{ color: 'white' }}>Analisando condições para pesca...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <Typography sx={{ color: '#ff6b6b', textAlign: 'center' }}>
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Nota circular */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `conic-gradient(#4caf50 0deg ${(dadosAtividade.atividade / 100) * 360}deg, rgba(255, 255, 255, 0.2) ${(dadosAtividade.atividade / 100) * 360}deg 360deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(30, 60, 114, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1 }}>
                    {dadosAtividade.atividade}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    ★★
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Qualidade */}
          <Typography variant="h6" align="center" sx={{ color: 'white', mb: 4, fontWeight: 'bold' }}>
            {dadosAtividade.qualidade}
          </Typography>

          {/* Métricas Meteorológicas */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <Typography variant="h6" align="center" sx={{ color: 'white', mb: 3, fontWeight: 'bold' }}>
              📊 Métricas do Cálculo
            </Typography>
            
            <Grid container spacing={2}>
              {/* Pressão Barométrica */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.pressao.impacto)}`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                      🌡️ Pressão Barométrica
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {dadosAtividade.fatores.pressao.valor.toFixed(0)} mb
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.pressao.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {dadosAtividade.fatores.pressao.impacto}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                      Ideal: 1013-1020 mb
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Temperatura */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.temperatura.impacto)}`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                      🌡️ Temperatura
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {dadosAtividade.fatores.temperatura.valor.toFixed(1)}°C
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.temperatura.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {dadosAtividade.fatores.temperatura.impacto}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                      Ideal: 15-25°C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Vento */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.vento.impacto)}`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                      💨 Velocidade do Vento
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {(dadosAtividade.fatores.vento.valor * 3.6).toFixed(1)} km/h
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.vento.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {dadosAtividade.fatores.vento.impacto}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                      Ideal: 5-15 km/h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Condições Climáticas */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.clima.impacto)}`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                      🌤️ Condições Climáticas
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                      {formatarCondicaoClimatica(dadosAtividade.fatores.clima.condicao)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.clima.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {dadosAtividade.fatores.clima.impacto}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                      Ideal: Céu Limpo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Explicação do Cálculo */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', mb: 1 }}>
                💡 Como é calculado?
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', display: 'block' }}>
                A nota de atividade é calculada com base nas condições meteorológicas ideais para pesca:
                Pressão (30%), Clima (30%), Temperatura (20%) e Vento (20%)
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}