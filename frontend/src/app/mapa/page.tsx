// src/app/mapa/page.tsx
import Map from '@/components/Map';

export default function MapaPage() {
  // Esta div é essencial para que o mapa tenha onde ser renderizado
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Map />
    </div>
  );
}