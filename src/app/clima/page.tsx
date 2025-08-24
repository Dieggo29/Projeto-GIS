// src/app/clima/page.tsx
'use client';

import { Box } from '@mui/material';

export default function ClimaPage() {
  return (
    // Container principal com layout de coluna, ocupando 100% da altura
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      
      {/* --- SEÇÃO 1: O MAPA GRANDE DO WINDY (Centralizado em Curitiba) --- */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          width="100%"
          height="100%"
          src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1&lat=-25.428&lon=-49.273"
          frameBorder="0"
        ></iframe>
      </Box>

      {/* --- SEÇÃO 2: A BARRA DE PREVISÃO DO TEMPO (Pré-selecionada para Curitiba) --- */}
      <Box sx={{ height: 'auto', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Este é o iframe corrigido com a tarja cinza removida */}
        <iframe
          loading="lazy"
          style={{ 
            border: "none", 
            width: "100%", 
            height: "230px",
            marginBottom: "-30px" /* Remove a tarja cinza escondendo a parte inferior */
          }}
          src="https://embed.windy.com/embed.html?type=forecast&location=coordinates&lat=-25.428&lon=-49.273&detailLat=-25.428&detailLon=-49.273&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
        ></iframe>
      </Box>

    </Box>
  );
}