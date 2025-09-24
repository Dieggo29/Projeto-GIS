# 🌍 Sistema de Informações Geográficas (GIS)

**Explore informações geográficas, condições climáticas e dados meteorológicos em tempo real!**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)](https://www.mapbox.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Configuração das APIs](#-configuração-das-apis)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Usar](#-como-usar)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Troubleshooting](#-troubleshooting)
- [Deploy](#-deploy)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

Este é um sistema GIS (Geographic Information System) moderno e interativo desenvolvido com Next.js que permite visualizar mapas, explorar dados geográficos e obter informações meteorológicas em tempo real. O projeto combina tecnologias de ponta para oferecer uma experiência rica e responsiva.

### 🎥 Demo

![GIS Demo](https://via.placeholder.com/800x400/0066cc/ffffff?text=Sistema+GIS+Demo)

## ✨ Funcionalidades

### 🗺️ **Mapa Interativo**
- Visualização com múltiplos estilos (satélite, ruas, terreno)
- Controle de pitch (inclinação) 3D
- Zoom e navegação fluidos
- Camada de água configurável
- Delimitações geográficas com GeoJSON

### 📍 **Seleção de Locais**
- Hierarquia completa: País → Estado → Cidade
- Dados GeoJSON para delimitações precisas
- Centralização automática no local selecionado
- Busca e filtros inteligentes

### 🌡️ **Dados Meteorológicos**
- Temperatura atual e sensação térmica
- Condições climáticas detalhadas
- Umidade, pressão atmosférica e vento
- Atualização em tempo real
- Histórico e previsões

### 🎨 **Interface Moderna**
- Design responsivo para todos os dispositivos
- Tema Material-UI customizado
- Sidebar colapsável e intuitiva
- Controles avançados de visualização
- Animações suaves e feedback visual

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[React 18](https://reactjs.org/)** - Biblioteca para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para JavaScript
- **[Material-UI (MUI)](https://mui.com/)** - Componentes de interface

### **Mapas e Geolocalização**
- **[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)** - Mapas interativos
- **[GeoJSON](https://geojson.org/)** - Formato de dados geográficos

### **APIs Externas**
- **[OpenWeather API](https://openweathermap.org/api)** - Dados meteorológicos
- **[Mapbox API](https://docs.mapbox.com/api/)** - Serviços de mapas

### **Desenvolvimento**
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formatação de código

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

### **Obrigatórios:**
- **Node.js** (versão 18.0 ou superior)
- **npm** (versão 8.0 ou superior) ou **yarn** (versão 1.22 ou superior)
- **Git** (para clonar o repositório)

### **Contas necessárias:**
- Conta no [Mapbox](https://www.mapbox.com/) (gratuita)
- Conta no [OpenWeather](https://openweathermap.org/) (gratuita)

### **Verificar instalações:**
```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Verificar versão do Git
git --version
```

## 🚀 Instalação e Configuração

### **Passo 1: Clonar o Repositório**
```bash
# Clone o repositório
git clone https://github.com/Dieggo29/Sistema-de-Informa-es-Geogr-ficas-GIS-.git

# Entre no diretório do projeto
cd Sistema-de-Informa-es-Geogr-ficas-GIS-
```

### **Passo 2: Instalar Dependências**
```bash
# Usando npm
npm install

# OU usando yarn
yarn install
```

### **Passo 3: Configurar Variáveis de Ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# OU no Windows
copy .env.example .env.local
```

## 🔑 Configuração das APIs

### **1. Mapbox Token**

1. Acesse [Mapbox](https://www.mapbox.com/)
2. Crie uma conta gratuita
3. Vá para [Account → Access Tokens](https://account.mapbox.com/access-tokens/)
4. Copie seu **Default Public Token**
5. Cole no arquivo `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiU0VVX1VTVUFSSU8iLCJhIjoiU0VVX1RPS0VOIn0.SUA_CHAVE_AQUI
```

### **2. OpenWeather API Key**

1. Acesse [OpenWeather](https://openweathermap.org/)
2. Crie uma conta gratuita
3. Vá para [API Keys](https://home.openweathermap.org/api_keys)
4. Copie sua **API Key**
5. Cole no arquivo `.env.local`:

```env
OPENWEATHER_API_KEY=sua_chave_openweather_aqui
```

### **3. Arquivo .env.local Completo**
```env
# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mapbox Access Token
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiU0VVX1VTVUFSSU8iLCJhIjoiU0VVX1RPS0VOIn0.SUA_CHAVE_AQUI

# OpenWeather API Key
OPENWEATHER_API_KEY=sua_chave_openweather_aqui
```

## ▶️ Executando o Projeto

### **Desenvolvimento**
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# OU
yarn dev
```

### **Produção**
```bash
# Build da aplicação
npm run build

# Iniciar em modo produção
npm start

# OU
yarn build
yarn start
```

### **Acessar a Aplicação**
Abra seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto