const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export const apiService = {
  async getPublicConfig() {
    const response = await fetch(`${API_BASE_URL}/api/config/public-config`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar configurações: ${response.status}`);
    }
    return response.json();
  }
};