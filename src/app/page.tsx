// src/app/page.tsx
'use client';

import { Box, Typography } from '@mui/material';

export default function HomePage() {
return (
<Box
sx={{
position: 'relative',
height: '100vh', // Use 'vh' para ocupar a altura total da tela
width: '100vw', // Use 'vw' para ocupar a largura total da tela
overflow: 'hidden',
display: 'flex',
flexDirection: 'column',
alignItems: 'center', // Centraliza horizontalmente
justifyContent: 'center', // Centraliza verticalmente
// --- ESTILO PARA A IMAGEM DE FUNDO (Centralizada) ---
backgroundImage: 'url("/images/campo-milho.jpg")',
backgroundSize: 'cover',
backgroundPosition: 'center',
backgroundRepeat: 'no-repeat',
}}
>
{/* --- CONTEÚDO CENTRALIZADO E COM TEXTO ALTERADO --- */}
<Box
sx={{
zIndex: 1,
textAlign: 'center',
backgroundColor: 'rgba(0, 0, 0, 0.5)',
padding: '2rem',
borderRadius: '1rem',
}}
>
<Typography variant="h5" component="div" sx={{ color: 'white', mb: 1 }}>
Site Teste
</Typography>
<Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
Site Teste
</Typography>
<Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
Site Teste
</Typography>
</Box>
</Box>
);
}