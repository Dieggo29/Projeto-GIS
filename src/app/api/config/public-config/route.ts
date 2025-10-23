import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const publicConfig = {
      mapbox: {
        // Token temporário para demonstração (não funcionará, mas não causará erro)
        accessToken: process.env.MAPBOX_ACCESS_TOKEN || null
      },
      api: {
        baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      }
    };

    return NextResponse.json(publicConfig);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}