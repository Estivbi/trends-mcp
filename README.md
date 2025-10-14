# MCP Trends Monitoring Platform

Una plataforma de monitorización de tendencias con integración MCP (Model Context Protocol) para Claude Desktop y otros LLMs.

## 🏗️ Arquitectura

```
[Claude Desktop] ↔ [MCP Server (STDIO)] ↔ [Backend API] ↔ [APIs Reales]
       ↓                     ↓                    ↓             ↓
   [Chat IA]          [4 Herramientas]     [Puerto 3001]  [YouTube, Reddit, etc]
                  
[MCP Inspector] ← [MCP Server] (Desarrollo y Testing)
```

### **Casos de Uso:**
- 🆓 **Claude Desktop**: Gratis, sin límites, perfecto para uso personal
- 🔧 **MCP Inspector**: Desarrollo y testing de herramientas
- 🚀 **APIs Reales**: YouTube, Reddit, Twitter (eliminando mock data)

## 📁 Estructura del Proyecto

```
trends-mcp/
├── apps/
│   ├── frontend-astro/         # Web Interface (opcional)
│   └── backend-api/            # API Node.js + Express (puerto 3001)
├── mcp/                        # Servidor MCP STDIO ✅
├── docs/                       # Documentación y guías
│   ├── claude-desktop-setup.md # Setup Claude Desktop GRATIS
│   ├── real-apis-implementation.md # Plan APIs reales  
│   └── llm-strategy.md         # Estrategia LLM híbrida
└── .github/                    # CI/CD workflows
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js >= 18
- npm >= 9
- Claude Desktop (gratis) - **Recomendado**

### Instalación Rápida

1. **Clonar e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar backend API:**
   ```bash
   cd apps/backend-api
   PORT=3001 npm run dev
   ```

3. **Configurar Claude Desktop (GRATIS):**
   ```bash
   # Ver guía completa en docs/claude-desktop-setup.md
   # Descargar: https://claude.ai/download
   # Configurar: ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

4. **Probar con MCP Inspector:**
   ```bash
   cd mcp && npm run inspector
   ```

### URLs de Desarrollo
- **Backend API**: http://localhost:3001
- **MCP Inspector**: http://localhost:3001 (cuando se ejecuta inspector)
- **Claude Desktop**: App local (gratis, sin límites)

## 🔧 Comandos Disponibles

```bash
# Desarrollo Principal
npm run dev:backend        # Backend API en puerto 3001 
cd mcp && npm run inspector # MCP Inspector para testing 

# MCP Server
npm run dev:mcp           # MCP server STDIO
npm run build:mcp         # Compilar MCP server

# Frontend (opcional)
npm run dev:frontend      # Frontend Astro
npm run build:frontend    # Build frontend

# Todos los servicios
npm run dev               # Backend + Frontend + MCP
npm run build             # Build completo

# Testing
npm run test             # Tests backend
npm run lint             # Linting TypeScript
```

## 📊 Características

### ✅ Estado Actual (Funcional)
- ✅ **MCP Server**: 4 herramientas funcionando (get_trends, search_trends, etc.)
- ✅ **Backend API**: Puerto 3001, endpoints REST, mock data
- ✅ **MCP Inspector**: Testing completo de herramientas
- ✅ **Claude Desktop**: Configuración documentada y lista

### 🔄 En Desarrollo (Prioridad)
- [ ] **YouTube Data API v3**: Eliminar mock data, datos reales España
- [ ] **Reddit API**: Posts trending con OAuth
- [ ] **Twitter/X API v2**: Hashtags trending
- [ ] **Cache inteligente**: Fallbacks y rate limiting

### 🔮 Futuro
- Claude Desktop configurado y funcionando completamente
- Análisis de sentimientos con LLM local
- Web interface opcional para dashboards
- APIs adicionales (TikTok, Instagram, Google Trends)

## 🛠️ Tecnologías

- **LLM Interface**: Claude Desktop (gratis, sin límites)
- **MCP Server**: Model Context Protocol + STDIO transport
- **Backend**: Node.js + Express + TypeScript (puerto 3001)
- **APIs Reales**: YouTube Data API v3, Reddit API, Twitter API v2
- **Sin Base de Datos**: Llamadas directas a APIs, cache en memoria
- **Frontend**: Astro + TypeScript + Tailwind CSS (opcional)
- **Development**: MCP Inspector, tsx, TypeScript
- **Testing**: Jest + Supertest

## 📝 Variables de Entorno

```env
# Backend API
PORT=3001
NODE_ENV=development
JWT_SECRET=tu-jwt-secret-super-seguro
CORS_ORIGIN=http://localhost:4321

# APIs Reales (configurar gradualmente)
YOUTUBE_API_KEY=tu-youtube-api-key
TWITTER_BEARER_TOKEN=tu-twitter-bearer-token  
REDDIT_CLIENT_ID=tu-reddit-client-id
REDDIT_CLIENT_SECRET=tu-reddit-client-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**Nota**: Claude Desktop no requiere API keys - es completamente gratis

## 📚 Documentación

- 🆓 **[Claude Desktop Setup](docs/claude-desktop-setup.md)** - Configuración completa GRATIS
- 📊 **[APIs Reales Implementation](docs/real-apis-implementation.md)** - Plan detallado
- 🤖 **[LLM Strategy](docs/llm-strategy.md)** - Estrategia híbrida gratuita
- 📋 **[API Specification](docs/api-spec.md)** - Endpoints del backend

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🚀 Quick Start con Claude Desktop

1. **Backend funcionando:**
   ```bash
   cd apps/backend-api && PORT=3001 npm run dev
   ```

2. **Descargar Claude Desktop:** https://claude.ai/download

3. **Configurar MCP:** Ver [docs/claude-desktop-setup.md](docs/claude-desktop-setup.md)

4. **Probar herramientas:**
   ```
   Claude: "¿Qué tendencias están viral en YouTube ahora?"
   Claude: "Genera 5 ideas de video basadas en tendencias actuales"
   ```

---

**¡Construido con ❤️ para Claude Desktop + MCP + APIs reales!**