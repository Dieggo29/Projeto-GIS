import axios from 'axios';

const chatAPI = axios.create({
  baseURL: process.env.CHAT_API_URL || 'https://sua-api-chat.vercel.app',
  timeout: 10000,
});

const rifasAPI = axios.create({
  baseURL: process.env.RIFAS_API_URL || 'https://sua-api-rifas.vercel.app',
  timeout: 10000,
});

// Serviços do Chat
export const chatService = {
  sendMessage: async (message: string) => {
    const response = await chatAPI.post('/api/chat', { message });
    return response.data;
  }
};

// Serviços das Rifas
export const rifasService = {
  getRifas: async () => {
    const response = await rifasAPI.get('/api/rifas');
    return response.data;
  },
  
  buyNumbers: async (numbers: number[], buyerName: string, buyerPhone: string) => {
    const response = await rifasAPI.post('/api/rifas', {
      numbers,
      buyerName,
      buyerPhone
    });
    return response.data;
  }
};

// Serviços de Clima (API externa gratuita)
export const weatherService = {
  getCurrentWeather: async (lat: number, lon: number) => {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=SUA_CHAVE&units=metric&lang=pt_br`
    );
    return response.data;
  }
};