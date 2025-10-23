# 🌍 Sistema de Informações Geográficas (GIS)

Um **Sistema de Informações Geográficas (GIS) interativo** desenvolvido com **Next.js, React e TypeScript**, permitindo a exploração de mapas, visualização de delimitações geográficas e acesso a dados meteorológicos em tempo real. O sistema oferece uma experiência intuitiva e responsiva, ideal para análises geoespaciais.

---

## 📌 Funcionalidades

* Visualização de mapas interativos com múltiplas camadas (Mapbox GL JS)
* Seleção hierárquica de localizações: País → Estado → Cidade
* Visualização climática via Windy.com (embed) baseada na sua localização
* Sidebar colapsável com controles contextuais e feedback visual
* Performance otimizada para arquivos GeoJSON grandes
* Proteção de chaves de API usando **Next.js API Routes**

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript
* **Mapas:** Mapbox GL JS, GeoJSON
* **UI/UX:** Material-UI (MUI)
* **APIs:** Windy (embed para clima)
* **Estado e Arquitetura:** Context API, API Routes para segurança
* **DevOps:** Variáveis de ambiente para proteção de chaves e configuração escalável

---

## 🚀 Como Executar o Projeto

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/Dieggo29/Projeto-GIS.git
   ```
2. **Instale as dependências:**

   ```bash
   cd Projeto-GIS
   npm install
   ```
3. **Configure suas variáveis de ambiente:**

   * Crie um arquivo `.env.local` na raiz do projeto
   * Adicione as variáveis:

     ```
     MAPBOX_ACCESS_TOKEN=seu_token_mapbox
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```
   * Observação: `MAPBOX_ACCESS_TOKEN` é lido pelo endpoint `GET /api/config/public-config`. Não faça commit do `.env.local` (já ignorado).
4. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```
5. **Acesse no navegador:**

   ```
   http://localhost:3000
   ```

---

## 💡 Desafios e Soluções

* **Renderização de Mapas Complexos:** Gerenciamento de múltiplas camadas e controles de zoom, pitch e estilo → solucionado com Mapbox GL JS e controles personalizados.
* **Hierarquia de Dados Geográficos:** Estrutura de dados otimizada para seleção em cascata (País → Estado → Cidade).
* **Segurança de API Keys:** Proteção de chaves sensíveis usando API Routes do Next.js.
* **Performance com GeoJSON Grandes:** Implementação de carregamento sob demanda e renderização otimizada.
* **UX Intuitiva:** Sidebar colapsável, feedback visual e controles contextuais.

---

## 📷 Demonstração

<img width="1353" height="600" alt="Captura de tela 2025-09-25 000201" src="https://github.com/user-attachments/assets/c0d3fe8e-ea85-4fee-a9d2-ca2691bcd448" />

*Visualização do mapa com seleção de cidade e dados meteorológicos em tempo real.*

---

## 🔗 Links

* Projeto no GitHub: [https://github.com/Dieggo29/Projeto-GIS](https://github.com/Dieggo29/Projeto-GIS)

---

## 🏷️ Tecnologias e Skills

\#NextJS #React #TypeScript #Mapbox #GIS #MaterialUI #DataVisualization #FrontendDevelopment #APIIntegration #WebDevelopment
